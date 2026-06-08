package com.rnt.rent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.rnt.rent.entity.Vorder;
import java.util.Optional;

@Repository
public interface VorderRepository extends JpaRepository<Vorder, Long> {
    Optional<Vorder> findByOIdAndTenantId(Long oId, String tenantId);
    void deleteByOIdAndTenantId(Long oId, String tenantId);
}
