package com.rnt.rent.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.rnt.rent.entity.Vehicle;

@Repository
public interface VehicleRepository extends MongoRepository<Vehicle, String> {
}
