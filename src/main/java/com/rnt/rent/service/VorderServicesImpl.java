package com.rnt.rent.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rnt.rent.entity.Vorder;
import com.rnt.rent.repository.VorderRepository;
import com.rnt.rent.tenant.TenantContext;

@Service
public class VorderServicesImpl implements VorderServices{
	
	@Autowired
	VorderRepository vorderRepo;

	@Override
	@Transactional
	public Vorder createVorder(Vorder v) {
        if (v.getTenantId() == null) {
            v.setTenantId(TenantContext.getTenantId());
        }
		return vorderRepo.save(v);
	}

	@Override
	public Optional<Vorder> getVorderById(Long id) {
		return vorderRepo.findByOIdAndTenantId(id, TenantContext.getTenantId());
	}

	@Override
	public List<Vorder> allorder() {
		return vorderRepo.findAll();
	}

	@Override
	@Transactional
	public void deleteOrderById(Long id) {
		vorderRepo.deleteByOIdAndTenantId(id, TenantContext.getTenantId());
	}
}
