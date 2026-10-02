package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Booking;
import com.example.demo.model.Customer;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.CustomerRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;


@Service
public class CustomerServiceImpl implements CustomerService
{
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public Customer saveCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Override
    public Customer getCustomerById(int id) 
    {
        return customerRepository
        		.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    public Customer updateCustomer(int id, Customer updatedCustomer) 
    {
        Customer existingCustomer = customerRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        existingCustomer.setName(updatedCustomer.getName());
        existingCustomer.setEmail(updatedCustomer.getEmail());
        existingCustomer.setPhone(updatedCustomer.getPhone());
        existingCustomer.setAddress(updatedCustomer.getAddress());

        return customerRepository.save(existingCustomer);
    }

    @Override
    public void deleteCustomer(int id) 
    {
        customerRepository.deleteById(id);
    }

    @Override
    public List<Customer> searchByName(String name) 
    {
        return customerRepository.findByNameContaining(name);
    }

    @Override
    public List<Customer> searchByPhone(String phone) 
    {
        return customerRepository.findByPhone(phone);
    }
    
    @Override
    public List<Booking> getCustomerHistory(int customerId) 
    {
        return bookingRepository.findByCustomerCustomerId(customerId);
    }
    
    @Override
    public Page<Customer> getCustomersWithPagination(int page, int size, String sortBy) {

        return customerRepository.findAll(
                PageRequest.of(page, size, Sort.by(sortBy).ascending())
        );
    }

}
