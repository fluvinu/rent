package com.rnt.rent.controller;

import com.rnt.rent.entity.EntityType;
import com.rnt.rent.repository.EntityTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entity-types")
public class EntityTypeController {

    @Autowired
    private EntityTypeRepository entityTypeRepository;

    @GetMapping
    public List<EntityType> getAll() {
        return entityTypeRepository.findAll();
    }

    @PostMapping
    public EntityType create(@RequestBody EntityType entityType) {
        return entityTypeRepository.save(entityType);
    }

    @GetMapping("/{id}")
    public EntityType getById(@PathVariable String id) {
        return entityTypeRepository.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public EntityType update(@PathVariable String id, @RequestBody EntityType entityType) {
        entityType.setId(id);
        return entityTypeRepository.save(entityType);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        entityTypeRepository.deleteById(id);
    }
}
