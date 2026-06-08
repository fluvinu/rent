package com.rnt.rent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.rnt.rent.entity.Customer;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCIdAndTenantId(Long cId, String tenantId);
    void deleteByCIdAndTenantId(Long cId, String tenantId);
}
