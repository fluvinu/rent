package com.rnt.rent.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.rnt.rent.entity.Vorder;

@Repository
public interface VorderRepository extends MongoRepository<Vorder, String> {
}
