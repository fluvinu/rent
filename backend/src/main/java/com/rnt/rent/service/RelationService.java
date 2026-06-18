package com.rnt.rent.service;

import com.rnt.rent.entity.EntityRecord;
import com.rnt.rent.entity.EntityType;
import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.repository.EntityRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Referential integrity and inline expansion for RELATION fields. A relation
 * value is the {@code id} (ONE) or list of ids (MANY) of records of the target
 * entity type.
 */
@Service
public class RelationService {

    @Autowired
    private EntityRecordRepository entityRecordRepository;

    /** Verifies every referenced record exists and belongs to the target entity type. */
    public void validateRelations(Map<String, Object> data, EntityType type) {
        if (type.getFields() == null || data == null) {
            return;
        }
        for (FieldDefinition field : type.getFields()) {
            if (field.getType() != FieldType.RELATION) {
                continue;
            }
            Object value = data.get(field.getKey());
            if (value == null) {
                continue;
            }
            for (String refId : idsOf(value)) {
                EntityRecord ref = entityRecordRepository.findById(refId).orElseThrow(() ->
                        new IllegalArgumentException(field.getName() + " references missing record: " + refId));
                if (field.getRelationTargetType() != null
                        && !field.getRelationTargetType().equals(ref.getEntityTypeId())) {
                    throw new IllegalArgumentException(
                            field.getName() + " must reference records of type " + field.getRelationTargetType());
                }
            }
        }
    }

    /** Returns a copy of records with the requested relation fields resolved inline under {@code _expanded}. */
    public List<Map<String, Object>> expand(List<EntityRecord> records, EntityType type, List<String> fieldKeys) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (EntityRecord record : records) {
            Map<String, Object> view = new LinkedHashMap<>();
            view.put("id", record.getId());
            view.put("entityTypeId", record.getEntityTypeId());
            view.put("data", record.getData());
            view.put("createdAt", record.getCreatedAt());
            view.put("updatedAt", record.getUpdatedAt());

            if (fieldKeys != null && !fieldKeys.isEmpty() && record.getData() != null) {
                Map<String, Object> expanded = new LinkedHashMap<>();
                for (String key : fieldKeys) {
                    Object value = record.getData().get(key);
                    if (value == null) {
                        continue;
                    }
                    List<EntityRecord> resolved = new ArrayList<>();
                    for (String refId : idsOf(value)) {
                        entityRecordRepository.findById(refId).ifPresent(resolved::add);
                    }
                    expanded.put(key, resolved);
                }
                view.put("_expanded", expanded);
            }
            out.add(view);
        }
        return out;
    }

    private List<String> idsOf(Object value) {
        List<String> ids = new ArrayList<>();
        if (value instanceof List<?> list) {
            for (Object item : list) {
                if (item != null) {
                    ids.add(String.valueOf(item));
                }
            }
        } else {
            ids.add(String.valueOf(value));
        }
        return ids;
    }
}
