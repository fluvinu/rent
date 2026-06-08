package com.rnt.rent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.rnt.rent.entity.Vehicle;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByIdAndTenantId(Long id, String tenantId);
    void deleteByIdAndTenantId(Long id, String tenantId);
}
