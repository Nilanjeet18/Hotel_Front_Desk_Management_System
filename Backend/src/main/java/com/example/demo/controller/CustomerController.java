package com.example.demo.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.Booking;
import com.example.demo.model.Customer;
import com.example.demo.service.CustomerService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/customers")
@CrossOrigin(origins = "*")
@Validated
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // CREATE — ADMIN + RECEPTIONIST (needed while making a new booking)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public Customer createCustomer(@Valid @RequestBody Customer customer) {
        return customerService.saveCustomer(customer);
    }

    // VIEW ALL — ADMIN + RECEPTIONIST
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    // VIEW ONE — ADMIN + RECEPTIONIST
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public Customer getCustomer(@PathVariable int id) {
        return customerService.getCustomerById(id);
    }

    // UPDATE — ADMIN + RECEPTIONIST
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public Customer updateCustomer(@PathVariable int id,
                                   @Valid @RequestBody Customer customer) {
        return customerService.updateCustomer(id, customer);
    }

    // DELETE — ADMIN ONLY
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteCustomer(@PathVariable int id) {
        customerService.deleteCustomer(id);
        return "Customer deleted successfully";
    }

    // SEARCH BY NAME — ADMIN + RECEPTIONIST
    @GetMapping("/search/name")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public List<Customer> searchByName(@RequestParam String name) {
        return customerService.searchByName(name);
    }

    // SEARCH BY PHONE — ADMIN + RECEPTIONIST (main lookup during walk-in booking)
    @GetMapping("/search/phone")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public List<Customer> searchByPhone(@RequestParam String phone) {
        return customerService.searchByPhone(phone);
    }

    // BOOKING HISTORY — ADMIN + RECEPTIONIST + MANAGER
    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','RECEPTIONIST')")
    public List<Booking> getCustomerHistory(@PathVariable int id) {
        return customerService.getCustomerHistory(id);
    }

    // PAGINATED LIST — ADMIN + RECEPTIONIST
    @GetMapping("/paged")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public Page<Customer> getCustomersWithPagination(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(defaultValue = "customerId") String sortBy) {
        return customerService.getCustomersWithPagination(page, size, sortBy);
    }
}