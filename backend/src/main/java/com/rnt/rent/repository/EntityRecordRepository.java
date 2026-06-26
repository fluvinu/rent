package com.rnt.rent.repository;

import com.rnt.rent.entity.EntityRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntityRecordRepository extends MongoRepository<EntityRecord, String> {
    List<EntityRecord> findByEntityTypeId(String entityTypeId);
    List<EntityRecord> findByParentRecordId(String parentRecordId);
}
