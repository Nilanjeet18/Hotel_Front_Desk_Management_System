package com.example.demo.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.BookingDTO;
import com.example.demo.dto.GuestDTO;
import com.example.demo.model.Booking;
import com.example.demo.model.BookingGuest;
import com.example.demo.model.Customer;
import com.example.demo.model.Room;
import com.example.demo.repository.BookingGuestRepository;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.RoomRepository;
import java.util.ArrayList;

@Service
public class BookingServiceImp implements BookingService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingGuestRepository bookingGuestRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public boolean isRoomAvailable(int roomId, LocalDate checkIn, LocalDate checkOut) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        List<Booking> overlapping = bookingRepository
                .findOverlappingBookings(roomId, checkIn, checkOut);

        return overlapping.isEmpty();
    }

    @Override
    public Booking getBookingById(int bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
    }

    @Override
    public BookingDTO updateBooking(int bookingId, BookingDTO bookingDTO) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        LocalDate newCheckIn  = bookingDTO.getCheckInDate();
        LocalDate newCheckOut = bookingDTO.getCheckOutDate();

        if (newCheckIn == null || newCheckOut == null) {
            throw new RuntimeException("Check-in and Check-out dates are required");
        }

        long days = ChronoUnit.DAYS.between(newCheckIn, newCheckOut);
        if (days <= 0) {
            throw new RuntimeException("Invalid dates: check-out must be after check-in");
        }

        double totalAmount = days * booking.getRoom().getPrice();
        booking.setCheckIn(newCheckIn);
        booking.setCheckOut(newCheckOut);
        booking.setTotalAmount(totalAmount);

        Booking updated = bookingRepository.save(booking); 
        return modelMapper.map(updated, BookingDTO.class);
    }

    @Override
    public Booking createBooking(int roomId, int customerId,
                                 LocalDate checkIn, LocalDate checkOut) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        long days = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (days <= 0) throw new RuntimeException("Invalid date");

        if (!isRoomAvailable(roomId, checkIn, checkOut)) {
            throw new RuntimeException("Room not available for the selected dates");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        double totalAmount = days * room.getPrice();

        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setCustomer(customer);
        booking.setCheckIn(checkIn);
        booking.setCheckOut(checkOut);
        booking.setTotalAmount(totalAmount);
        booking.setStatus("CONFIRMED");

        return bookingRepository.save(booking);
    }

    @Override
    public String cancelBooking(int bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        return "Booking Cancelled Successfully";
    }

    // Marks the booking CHECKED_OUT. Guards against double checkout.
    @Override
    public Booking checkout(int bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new RuntimeException("Cannot check out a cancelled booking");
        }
        if ("CHECKED_OUT".equalsIgnoreCase(booking.getStatus())) {
            throw new RuntimeException("This booking is already checked out");
        }

        booking.setStatus("CHECKED_OUT");
        return bookingRepository.save(booking);
    }

    @Override
    public BookingDTO createBooking1(BookingDTO bookingDTO) {
        Room room = roomRepository.findById(bookingDTO.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        long days = ChronoUnit.DAYS.between(
                bookingDTO.getCheckInDate(), bookingDTO.getCheckOutDate());

        if (days <= 0) throw new RuntimeException("Invalid dates");

        if (!isRoomAvailable(bookingDTO.getRoomId(), bookingDTO.getCheckInDate(), bookingDTO.getCheckOutDate())) {
            throw new RuntimeException("Room not available for the selected dates");
        }

        Customer customer = customerRepository.findById(bookingDTO.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        double totalAmount = days * room.getPrice();

        Booking booking = new Booking();
        booking.setCheckIn(bookingDTO.getCheckInDate());
        booking.setCheckOut(bookingDTO.getCheckOutDate());
        booking.setRoom(room);
        booking.setCustomer(customer);
        booking.setStatus("CONFIRMED");
        booking.setTotalAmount(totalAmount);

        Booking savedBooking = bookingRepository.save(booking);

        // NEW - persist any companions listed alongside the primary guest
        if (bookingDTO.getGuests() != null && !bookingDTO.getGuests().isEmpty()) {
            List<BookingGuest> guestEntities = new ArrayList<>();
            for (GuestDTO g : bookingDTO.getGuests()) {
                BookingGuest guest = new BookingGuest();
                guest.setName(g.getName());
                guest.setEmail(g.getEmail());
                guest.setPhone(g.getPhone());
                guest.setAddress(g.getAddress());
                guest.setBooking(savedBooking);
                guestEntities.add(guest);
            }
            bookingGuestRepository.saveAll(guestEntities);
            savedBooking.setGuests(guestEntities);
        }

        return modelMapper.map(savedBooking, BookingDTO.class);
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Double getDailyRevenue(LocalDate date) {
        Double revenue = bookingRepository.getDailyRevenue(date);
        return revenue != null ? revenue : 0.0;
    }

    @Override
    public Double getMonthlyOccupancy(int month, int year) {
        Long bookedRooms = bookingRepository.countMonthlyBookings(month, year);
        if (bookedRooms == null) bookedRooms = 0L;
        double totalRooms = 50.0;
        return (bookedRooms / totalRooms) * 100;
    }

    @Override
    public List<Booking> getCustomerBookings(int id) {
        return bookingRepository.findByCustomerCustomerId(id);
    }
}