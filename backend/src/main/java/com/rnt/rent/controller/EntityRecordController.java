package com.rnt.rent.controller;

import com.rnt.rent.entity.EntityRecord;
import com.rnt.rent.query.QueryRequest;
import com.rnt.rent.service.EntityRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
public class EntityRecordController {

    @Autowired
    private EntityRecordService entityRecordService;

    @GetMapping("/entity/{entityTypeId}")
    public List<EntityRecord> getByEntityType(@PathVariable String entityTypeId) {
        return entityRecordService.getByEntityTypeId(entityTypeId);
    }

    @GetMapping("/parent/{parentRecordId}")
    public List<EntityRecord> getByParentRecordId(@PathVariable String parentRecordId) {
        return entityRecordService.getByParentRecordId(parentRecordId);
    }

    @PostMapping("/entity/{entityTypeId}/query")
    public List<Map<String, Object>> query(@PathVariable String entityTypeId,
                                           @RequestBody(required = false) QueryRequest request) {
        return entityRecordService.queryExpanded(entityTypeId, request);
    }

    @PostMapping("/entity/{entityTypeId}")
    public EntityRecord create(@PathVariable String entityTypeId, @RequestBody EntityRecord record) {
        return entityRecordService.create(entityTypeId, record);
    }

    @GetMapping("/{id}")
    public EntityRecord getById(@PathVariable String id) {
        return entityRecordService.getById(id);
    }

    @PutMapping("/{id}")
    public EntityRecord update(@PathVariable String id, @RequestBody EntityRecord record) {
        return entityRecordService.update(id, record);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        entityRecordService.delete(id);
    }
}
