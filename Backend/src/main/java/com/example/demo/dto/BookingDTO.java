package com.example.demo.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BookingDTO {
    @NotNull(message = "Room ID is required")
    private int roomId;
    @NotNull(message = "Customer ID is required")
    private int customerId;
    @NotNull(message = "Check-in date is required")
    private LocalDate checkInDate;
    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;

    private String status;

    // NEW - people staying with the primary guest. Optional list —
    // an empty/omitted list just means it's a solo booking.
    @Valid
    private List<GuestDTO> guests = new ArrayList<>();

    public  int getRoomId() {
        return roomId;
    }
    public void setRoomId( int roomId) {
        this.roomId = roomId;
    }
    public  int getCustomerId() {
        return customerId;
    }
    public void setCustomerId( int customerId) {
        this.customerId = customerId;
    }
    public LocalDate getCheckInDate() {
        return checkInDate;
    }
    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }
    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }
    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public List<GuestDTO> getGuests() { return guests; }
    public void setGuests(List<GuestDTO> guests) { this.guests = guests; }
}