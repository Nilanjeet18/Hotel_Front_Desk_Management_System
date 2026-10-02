package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;

import com.example.demo.dto.BookingDTO;
import com.example.demo.model.Booking;

public interface BookingService {
    boolean isRoomAvailable(int roomId, LocalDate checkIn, LocalDate checkOut);
    Booking getBookingById(int bookingId);
    BookingDTO updateBooking(int bookingId, BookingDTO bookingDTO);
    Booking createBooking(int roomId, int customerId, LocalDate checkIn, LocalDate checkOut);
    String cancelBooking(int bookingId);
    BookingDTO createBooking1(BookingDTO bookingDTO);
    List<Booking> getAllBookings();
    Double getDailyRevenue(LocalDate date);
    Double getMonthlyOccupancy(int month, int year);
    List<Booking> getCustomerBookings(int id);

    // ✅ NEW — marks a booking CHECKED_OUT (Receptionist workflow, before invoicing)
    Booking checkout(int bookingId);
}