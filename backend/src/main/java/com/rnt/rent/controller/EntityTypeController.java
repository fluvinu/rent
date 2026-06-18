package com.rnt.rent.controller;

import com.rnt.rent.entity.EntityType;
import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.service.MetadataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entity-types")
public class EntityTypeController {

    @Autowired
    private MetadataService metadataService;

    @GetMapping
    public List<EntityType> getAll() {
        return metadataService.getAll();
    }

    @PostMapping
    public EntityType create(@RequestBody EntityType entityType) {
        return metadataService.create(entityType);
    }

    @GetMapping("/{id}")
    public EntityType getById(@PathVariable String id) {
        return metadataService.getById(id);
    }

    @PutMapping("/{id}")
    public EntityType update(@PathVariable String id, @RequestBody EntityType entityType) {
        return metadataService.update(id, entityType);
    }

    @PostMapping("/{id}/fields")
    public EntityType addField(@PathVariable String id, @RequestBody FieldDefinition field) {
        return metadataService.addField(id, field);
    }

    @DeleteMapping("/{id}/fields/{fieldKey}")
    public EntityType removeField(@PathVariable String id, @PathVariable String fieldKey) {
        return metadataService.removeField(id, fieldKey);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        metadataService.delete(id);
    }
}
