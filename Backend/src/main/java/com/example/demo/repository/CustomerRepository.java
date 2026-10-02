package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Integer> 
{
    @Query("SELECT c FROM Customer c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Customer> findByNameContaining(String name);

    List<Customer> findByPhone(String phone);
}
