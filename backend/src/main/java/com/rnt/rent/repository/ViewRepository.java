package com.rnt.rent.repository;

import com.rnt.rent.entity.View;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViewRepository extends MongoRepository<View, String> {
    List<View> findByEntityTypeId(String entityTypeId);
}
