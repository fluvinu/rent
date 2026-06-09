package com.rnt.rent.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.rnt.rent.entity.Customer;

@Repository
public interface CustomerRepository extends MongoRepository<Customer, String> {
}
