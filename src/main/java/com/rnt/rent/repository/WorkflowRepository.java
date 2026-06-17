package com.rnt.rent.repository;

import com.rnt.rent.entity.Workflow;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowRepository extends MongoRepository<Workflow, String> {
    List<Workflow> findByEntityTypeId(String entityTypeId);
}
