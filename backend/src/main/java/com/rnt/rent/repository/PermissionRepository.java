package com.rnt.rent.repository;

import com.rnt.rent.entity.Permission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionRepository extends MongoRepository<Permission, String> {
    List<Permission> findByRole(String role);
    List<Permission> findByEntityTypeId(String entityTypeId);
}
