package com.rnt.rent.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rnt.rent.entity.Customer;
import com.rnt.rent.repository.CustomerRepository;

@Service
public class CustomerServiceImpl implements CustomerServices{
	
	@Autowired
    private CustomerRepository cusromerRepo;
	
	@Override
	@Transactional
	public Customer saveCustomer(Customer cus) {
		return cusromerRepo.save(cus);
	}

	@Override
	public Optional<Customer> getCustomerById(String id) {
		return cusromerRepo.findById(id);
	}

	@Override
	@Transactional
	public void deleteCustomer(String id) {
		cusromerRepo.deleteById(id);
	}

	@Override
	public List<Customer> getAllCustomer() {
		return cusromerRepo.findAll();
	}
}
