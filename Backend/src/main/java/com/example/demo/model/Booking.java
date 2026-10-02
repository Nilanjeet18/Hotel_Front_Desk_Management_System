package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "booking")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int bookingId;

    @Column(name = "check_in")
    private LocalDate checkIn;

    @Column(name = "check_out")
    private LocalDate checkOut;

    private String status;
    private Double totalAmount;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    // NEW - additional people staying in the room with the primary guest.
    // cascade=ALL + orphanRemoval so guests save/delete along with the booking.
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingGuest> guests = new ArrayList<>();

    public int getBookingId()           { return bookingId; }
    public void setBookingId(int id)    { this.bookingId = id; }
    public LocalDate getCheckIn()             { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    public LocalDate getCheckOut()              { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    public String getStatus()              { return status; }
    public void setStatus(String status)   { this.status = status; }
    public Double getTotalAmount()               { return totalAmount; }
    public void setTotalAmount(Double amount)    { this.totalAmount = amount; }
    public Customer getCustomer()                { return customer; }
    public void setCustomer(Customer customer)   { this.customer = customer; }
    public Room getRoom()             { return room; }
    public void setRoom(Room room)    { this.room = room; }

    public List<BookingGuest> getGuests() { return guests; }
    public void setGuests(List<BookingGuest> guests) { this.guests = guests; }
}