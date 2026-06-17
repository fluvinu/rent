package com.rnt.rent.service;

import com.rnt.rent.entity.EntityRecord;
import com.rnt.rent.entity.EntityType;
import com.rnt.rent.repository.EntityRecordRepository;
import com.rnt.rent.repository.EntityTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EntityRecordService {

    @Autowired
    private EntityRecordRepository entityRecordRepository;

    @Autowired
    private EntityTypeRepository entityTypeRepository;

    public List<EntityRecord> getByEntityTypeId(String entityTypeId) {
        return entityRecordRepository.findByEntityTypeId(entityTypeId);
    }

    public EntityRecord getById(String id) {
        return entityRecordRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Record not found"));
    }

    public EntityRecord create(String entityTypeId, EntityRecord record) {
        EntityType entityType = entityTypeRepository.findById(entityTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Entity Type not found"));

        validateRecordData(record.getData(), entityType);

        record.setEntityTypeId(entityTypeId);
        return entityRecordRepository.save(record);
    }

    public EntityRecord update(String id, EntityRecord record) {
        EntityRecord existing = getById(id);
        EntityType entityType = entityTypeRepository.findById(existing.getEntityTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Entity Type not found"));

        validateRecordData(record.getData(), entityType);

        record.setId(id);
        record.setEntityTypeId(existing.getEntityTypeId());
        return entityRecordRepository.save(record);
    }

    public void delete(String id) {
        entityRecordRepository.deleteById(id);
    }

    private void validateRecordData(Map<String, Object> data, EntityType entityType) {
        if (data == null) {
            data = Map.of();
        }

        if (entityType.getFields() != null) {
            for (EntityType.FieldDefinition field : entityType.getFields()) {
                if (field.isRequired() && !data.containsKey(field.getName())) {
                    throw new IllegalArgumentException("Missing required field: " + field.getName());
                }
                // We could add more robust type checking here based on field.getType()
            }
        }
    }
}
