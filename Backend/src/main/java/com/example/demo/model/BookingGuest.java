package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "booking_guests")
public class BookingGuest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "Guest name is required")
    private String name;

    // Optional — companions often don't provide these, unlike the
    // primary Customer record which requires them.
    private String email;
    private String phone;
    private String address;

    @ManyToOne
    @JoinColumn(name = "booking_id", referencedColumnName = "bookingId")
    private Booking booking;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
}