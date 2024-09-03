package com.rnt.rent.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.rnt.rent.entity.Customer;


@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // Custom query methods can be added if needed
}

