package com.rnt.rent.service;

import com.rnt.rent.entity.EntityRecord;
import com.rnt.rent.entity.EntityType;
import com.rnt.rent.query.QueryRequest;
import com.rnt.rent.repository.EntityRecordRepository;
import com.rnt.rent.service.PermissionService.Action;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EntityRecordService {

    @Autowired
    private EntityRecordRepository entityRecordRepository;

    @Autowired
    private MetadataService metadataService;

    @Autowired
    private FieldValidator fieldValidator;

    @Autowired
    private RelationService relationService;

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private QueryService queryService;

    @Autowired
    private WorkflowEngine workflowEngine;

    public List<EntityRecord> getByEntityTypeId(String entityTypeId) {
        permissionService.enforce(Action.READ, entityTypeId);
        return entityRecordRepository.findByEntityTypeId(entityTypeId).stream()
                .map(this::applyReadPermissions)
                .collect(Collectors.toList());
    }

    public List<EntityRecord> query(String entityTypeId, QueryRequest request) {
        permissionService.enforce(Action.READ, entityTypeId);
        return queryService.query(entityTypeId, request).stream()
                .map(this::applyReadPermissions)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> queryExpanded(String entityTypeId, QueryRequest request) {
        permissionService.enforce(Action.READ, entityTypeId);
        EntityType type = metadataService.getById(entityTypeId);
        List<EntityRecord> records = queryService.query(entityTypeId, request).stream()
                .map(this::applyReadPermissions)
                .collect(Collectors.toList());
        List<String> expand = request == null ? null : request.getExpand();
        return relationService.expand(records, type, expand);
    }

    public EntityRecord getById(String id) {
        EntityRecord record = entityRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Record not found"));
        permissionService.enforce(Action.READ, record.getEntityTypeId());
        return applyReadPermissions(record);
    }

    public EntityRecord create(String entityTypeId, EntityRecord record) {
        permissionService.enforce(Action.CREATE, entityTypeId);
        EntityType type = metadataService.getById(entityTypeId);

        permissionService.enforceWritableFields(record.getData(), entityTypeId);
        Map<String, Object> coerced = fieldValidator.validateAndCoerce(record.getData(), type);
        relationService.validateRelations(coerced, type);

        record.setId(null);
        record.setEntityTypeId(entityTypeId);
        record.setData(coerced);
        record.setCreatedAt(Instant.now());
        record.setUpdatedAt(Instant.now());
        record.setVersion(1);

        EntityRecord saved = entityRecordRepository.save(record);
        workflowEngine.onEvent(WorkflowEngine.EventType.RECORD_CREATED, entityTypeId, saved);
        return applyReadPermissions(saved);
    }

    public EntityRecord update(String id, EntityRecord record) {
        EntityRecord existing = entityRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Record not found"));
        String entityTypeId = existing.getEntityTypeId();
        permissionService.enforce(Action.UPDATE, entityTypeId);
        EntityType type = metadataService.getById(entityTypeId);

        permissionService.enforceWritableFields(record.getData(), entityTypeId);
        Map<String, Object> coerced = fieldValidator.validateAndCoerce(record.getData(), type);
        relationService.validateRelations(coerced, type);

        existing.setData(coerced);
        existing.setUpdatedAt(Instant.now());
        existing.setVersion(existing.getVersion() + 1);

        EntityRecord saved = entityRecordRepository.save(existing);
        workflowEngine.onEvent(WorkflowEngine.EventType.RECORD_UPDATED, entityTypeId, saved);
        return applyReadPermissions(saved);
    }

    public void delete(String id) {
        EntityRecord existing = entityRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Record not found"));
        permissionService.enforce(Action.DELETE, existing.getEntityTypeId());
        entityRecordRepository.deleteById(id);
        workflowEngine.onEvent(WorkflowEngine.EventType.RECORD_DELETED, existing.getEntityTypeId(), existing);
    }

    private EntityRecord applyReadPermissions(EntityRecord record) {
        record.setData(permissionService.projectReadable(record.getData(), record.getEntityTypeId()));
        return record;
    }
}
