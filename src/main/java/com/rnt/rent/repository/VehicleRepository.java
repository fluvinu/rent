package com.rnt.rent.repository;




import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rnt.rent.entity.Vehicle;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    // You can add custom query methods here if needed
    // e.g., List<Vehicle> findByIsAvailable(boolean isAvailable);
}

