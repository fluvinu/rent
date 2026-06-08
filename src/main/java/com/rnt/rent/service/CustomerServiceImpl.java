package com.rnt.rent.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rnt.rent.entity.Customer;
import com.rnt.rent.repository.CustomerRepository;
import com.rnt.rent.tenant.TenantContext;

@Service
public class CustomerServiceImpl implements CustomerServices{
	
	@Autowired
    private CustomerRepository cusromerRepo;
	
	@Override
	@Transactional
	public Customer saveCustomer(Customer cus) {
        if (cus.getTenantId() == null) {
            cus.setTenantId(TenantContext.getTenantId());
        }
		return cusromerRepo.save(cus);
	}

	@Override
	public Optional<Customer> getCustomerById(Long id) {
		return cusromerRepo.findByCIdAndTenantId(id, TenantContext.getTenantId());
	}

	@Override
	@Transactional
	public void deleteCustomer(Long id) {
		cusromerRepo.deleteByCIdAndTenantId(id, TenantContext.getTenantId());
	}

	@Override
	public List<Customer> getAllCustomer() {
		return cusromerRepo.findAll();
	}
}
