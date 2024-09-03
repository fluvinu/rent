package com.rnt.rent.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rnt.rent.entity.Vorder;

@Repository
public interface VorderRepository extends JpaRepository<Vorder, Long> {
    // Custom query methods can be added if needed
}
