package com.rnt.rent.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rnt.rent.entity.Customer;

import com.rnt.rent.service.CustomerServices;

@RestController
@RequestMapping("/cus")
public class CustomerController {
	
	@Autowired
	private CustomerServices customerrepo;
	
		@GetMapping("/hi")
	    public String test() {
	    	return "customer Controller";
	    }
	
		
	    @GetMapping("/")
	    public List<Customer> getAllCustomer() {
	        return customerrepo.getAllCustomer(); // checked
	    }
	
	    @GetMapping("/{id}")
	    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
	        Optional<Customer> customer = customerrepo.getCustomerById(id);
	        return customer.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); // checked
	    }
	
	 	@PostMapping
	    public Customer createCustomer(@RequestBody Customer cus) {
			return customerrepo.saveCustomer(cus);
	    	
	    }
	    
	    @PutMapping("/{id}")
	    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customer ){
	    	
			if(!customerrepo.getCustomerById(id).isPresent()) {
				return ResponseEntity.notFound().build();
			}
			
			customer.setcId(id);
			Customer updateCustomer= customerrepo.saveCustomer(customer);
			return ResponseEntity.ok(updateCustomer);
	    	
	    }
	    
	    @DeleteMapping("/{id}")
	    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
	        if (!customerrepo.getCustomerById(id).isPresent()) {
	            return ResponseEntity.notFound().build();
	        }
	        customerrepo.deleteCustomer(id);
	        return ResponseEntity.noContent().build();
	    }

}
