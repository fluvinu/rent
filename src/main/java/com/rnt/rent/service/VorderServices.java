package com.rnt.rent.service;

import java.util.List;
import java.util.Optional;
import com.rnt.rent.entity.Vorder;

public interface VorderServices {
	
	Vorder createVorder(Vorder v);

	Optional<Vorder> getVorderById(Long id);

	List<Vorder> allorder();

	void deleteOrderById(Long id);

}
