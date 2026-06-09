package com.rnt.rent.service;

import java.util.List;
import java.util.Optional;

import com.rnt.rent.entity.Customer;

public interface CustomerServices {
	
	public Customer saveCustomer(Customer cus);
    
    public Optional <Customer> getCustomerById(String id);

	public void deleteCustomer(String id);

	public List<Customer> getAllCustomer();

}
