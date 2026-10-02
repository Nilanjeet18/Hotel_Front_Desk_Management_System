package com.example.demo.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.example.demo.model.Booking;
import com.example.demo.model.Customer;

public interface CustomerService 
{
    Customer saveCustomer(Customer customer);

    List<Customer> getAllCustomers();

    Customer getCustomerById(int id);

    Customer updateCustomer(int id, Customer customer);

    void deleteCustomer(int id);

    List<Customer> searchByName(String name);

    List<Customer> searchByPhone(String phone);
    
    List<Booking> getCustomerHistory(int customerId);
    
    Page<Customer> getCustomersWithPagination(int page, int size,String sortBy);
}
