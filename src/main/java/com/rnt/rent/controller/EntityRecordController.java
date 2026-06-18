package com.rnt.rent.controller;

import com.rnt.rent.entity.EntityRecord;
import com.rnt.rent.query.QueryResult;
import com.rnt.rent.query.RecordQuery;
import com.rnt.rent.service.EntityRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
public class EntityRecordController {

    @Autowired
    private EntityRecordService entityRecordService;

    @GetMapping("/entity/{entityTypeId}")
    public List<EntityRecord> getByEntityType(@PathVariable String entityTypeId) {
        return entityRecordService.getByEntityTypeId(entityTypeId);
    }

    @PostMapping("/entity/{entityTypeId}")
    public EntityRecord create(@PathVariable String entityTypeId, @RequestBody EntityRecord record) {
        return entityRecordService.create(entityTypeId, record);
    }

    @PostMapping("/entity/{entityTypeId}/query")
    public QueryResult query(@PathVariable String entityTypeId, @RequestBody(required = false) RecordQuery query) {
        return entityRecordService.query(entityTypeId, query == null ? new RecordQuery() : query);
    }

    @GetMapping("/{id}")
    public EntityRecord getById(@PathVariable String id,
                                @RequestParam(required = false) List<String> expand) {
        return entityRecordService.getById(id, expand);
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
