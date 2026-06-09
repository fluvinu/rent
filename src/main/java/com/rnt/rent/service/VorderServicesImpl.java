package com.rnt.rent.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rnt.rent.entity.Vorder;
import com.rnt.rent.repository.VorderRepository;

@Service
public class VorderServicesImpl implements VorderServices{
	
	@Autowired
	VorderRepository vorderRepo;

	@Override
	@Transactional
	public Vorder createVorder(Vorder v) {
		return vorderRepo.save(v);
	}

	@Override
	public Optional<Vorder> getVorderById(String id) {
		return vorderRepo.findById(id);
	}

	@Override
	public List<Vorder> allorder() {
		return vorderRepo.findAll();
	}

	@Override
	@Transactional
	public void deleteOrderById(String id) {
		vorderRepo.deleteById(id);
	}
}
