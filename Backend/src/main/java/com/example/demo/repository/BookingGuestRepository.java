package com.example.demo.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.BookingGuest;

public interface BookingGuestRepository extends JpaRepository<BookingGuest, Integer> {
    List<BookingGuest> findByBooking_BookingId(int bookingId);
}