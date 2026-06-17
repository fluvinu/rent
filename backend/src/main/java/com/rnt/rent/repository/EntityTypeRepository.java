package com.rnt.rent.repository;

import com.rnt.rent.entity.EntityType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntityTypeRepository extends MongoRepository<EntityType, String> {
}
