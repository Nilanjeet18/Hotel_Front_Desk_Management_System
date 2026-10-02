package com.example.demo.dto;

import java.time.LocalDate;

public class BookingResponseDTO {
    private int bookingId;
    private int customerId;
    private int roomId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private double amount;
    private String status;

    // NEW - how many additional companions were added at booking time
    // (does NOT include the primary guest, so total occupants = this + 1)
    private int guestCount;

    public BookingResponseDTO() {}

    public BookingResponseDTO(int bookingId, int customerId, int roomId,
                               LocalDate checkInDate, LocalDate checkOutDate,
                               double amount, String status, int guestCount) {
        this.bookingId    = bookingId;
        this.customerId   = customerId;
        this.roomId       = roomId;
        this.checkInDate  = checkInDate;
        this.checkOutDate = checkOutDate;
        this.amount       = amount;
        this.status       = status;
        this.guestCount   = guestCount;
    }

    public int getBookingId()         { return bookingId; }
    public int getCustomerId()        { return customerId; }
    public int getRoomId()            { return roomId; }
    public LocalDate getCheckInDate() { return checkInDate; }
    public LocalDate getCheckOutDate(){ return checkOutDate; }
    public double getAmount()         { return amount; }
    public String getStatus()         { return status; }
    public int getGuestCount()        { return guestCount; }
}