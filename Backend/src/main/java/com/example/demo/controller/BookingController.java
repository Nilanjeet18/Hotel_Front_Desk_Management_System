package com.example.demo.controller;

import com.example.demo.dto.BookingDTO;
import com.example.demo.dto.BookingResponseDTO;
import com.example.demo.model.Booking;
import com.example.demo.service.BookingService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // CHECK AVAILABILITY - ADMIN + RECEPTIONIST
    @PostMapping("/reception/check")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<?> checkAvailability(@RequestBody BookingDTO dto) {
        boolean available = bookingService.isRoomAvailable(
            dto.getRoomId(), dto.getCheckInDate(), dto.getCheckOutDate()
        );
        return ResponseEntity.ok(java.util.Map.of("available", available));
    }

    // CREATE BOOKING - ADMIN + RECEPTIONIST
    @PostMapping("/reception/booking")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingDTO bookingDTO) {
        BookingDTO savedBooking = bookingService.createBooking1(bookingDTO);
        return ResponseEntity.ok(savedBooking);
    }

    // ALL BOOKINGS - ADMIN + MANAGER + RECEPTIONIST
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','RECEPTIONIST')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {

        List<Booking> bookings = bookingService.getAllBookings();

        List<BookingResponseDTO> response = bookings.stream().map(b ->
        new BookingResponseDTO(
            b.getBookingId(),
            b.getCustomer() != null ? b.getCustomer().getCustomerId() : 0,
            b.getRoom()     != null ? b.getRoom().getRoomId()         : 0,
            b.getCheckIn(),
            b.getCheckOut(),  
            b.getTotalAmount() != null ? b.getTotalAmount() : 0,
            b.getStatus(),
            b.getGuests() != null ? b.getGuests().size() : 0
        )
       ).toList();

        return ResponseEntity.ok(response);
    }

    // GET BOOKING BY ID - ADMIN + MANAGER
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','RECEPTIONIST')")
    public ResponseEntity<Booking> getBookingById(@PathVariable int id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // UPDATE BOOKING - ADMIN + MANAGER + RECEPTIONIST
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','RECEPTIONIST')")
    public ResponseEntity<?> updateBooking(@PathVariable int id, @RequestBody BookingDTO dto) {
        BookingDTO updated = bookingService.updateBooking(id, dto);
        return ResponseEntity.ok(updated);
    }

    // CANCEL BOOKING (hard) - ADMIN + MANAGER ONLY
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<String> cancelBooking(@PathVariable int id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    // REPORTS - ADMIN + MANAGER
    @GetMapping("/reports/daily-revenue")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Double> getDailyRevenue(@RequestParam String date) {
        return ResponseEntity.ok(bookingService.getDailyRevenue(LocalDate.parse(date)));
    }

    // CANCEL (soft, status update) - ADMIN + MANAGER + RECEPTIONIST
    @PutMapping("/cancel/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','RECEPTIONIST')")
    public ResponseEntity<String> cancelBooking1(@PathVariable int id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok("Booking cancelled successfully");
    }

    @GetMapping("/reports/monthly-occupancy")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Double> getMonthlyOccupancy(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(bookingService.getMonthlyOccupancy(month, year));
    }

    // CUSTOMER BOOKING HISTORY - ADMIN + MANAGER + RECEPTIONIST
    @GetMapping("/reports/customer-history/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','RECEPTIONIST')")
    public List<Booking> getCustomerHistory(@PathVariable int id) {
        return bookingService.getCustomerBookings(id);
    }
}