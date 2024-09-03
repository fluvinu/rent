package com.rnt.rent.service;

import java.util.List;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.rnt.rent.entity.Vorder;
import com.rnt.rent.repository.VorderRepository;

@Service
public class VorderServicesImpl implements VorderServices{
	
	@Autowired
	VorderRepository vorderRepo;

	@Override
	public Vorder createVorder(Vorder v) {
		// TODO Auto-generated method stub
		return vorderRepo.save(v);
	}

	@Override
	public Optional<Vorder> getVorderById(Long id) {
		// TODO Auto-generated method stub
		return vorderRepo.findById(id);
	}

	@Override
	public List<Vorder> allorder() {
		// TODO Auto-generated method stub
		return vorderRepo.findAll();
	}

	@Override
	public void deleteOrderById(Long id) {
		// TODO Auto-generated method stub
		 vorderRepo.deleteById(id);
		
	}
	

}
