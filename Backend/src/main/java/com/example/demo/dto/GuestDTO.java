package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

// Lightweight DTO for an additional person staying in the room
// alongside the primary (paying) guest. Only name is mandatory —
// companions often don't have their own email/phone on hand at
// booking time, unlike the primary Customer record.
public class GuestDTO {

    @NotBlank(message = "Guest name is required")
    private String name;

    private String email;
    private String phone;
    private String address;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}