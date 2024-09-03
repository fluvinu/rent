package com.rnt.rent.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rnt.rent.entity.Customer;
import com.rnt.rent.repository.CustomerRepository;

@Service
public class CustomerServiceImpl implements CustomerServices{
	
	@Autowired
    private CustomerRepository cusromerRepo;
	
	@Override
	public Customer saveCustomer(Customer cus) {
		// TODO Auto-generated method stub
		return cusromerRepo.save(cus);
	}

	@Override
	public Optional<Customer> getCustomerById(Long id) {
		// TODO Auto-generated method stub
		return cusromerRepo.findById(id);
	}

	@Override
	public void deleteCustomer(Long id) {
		// TODO Auto-generated method stub
		cusromerRepo.deleteById(id);
		
	}

	@Override
	public List<Customer> getAllCustomer() {
		// TODO Auto-generated method stub
		return cusromerRepo.findAll();
	}


}
