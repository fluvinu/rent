package com.rnt.rent.metadata;

import com.rnt.rent.entity.EntityRecord;
import com.rnt.rent.entity.EntityType;
import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.repository.EntityRecordRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Resolves RELATION fields into their target records. Expanded values are
 * attached under a non-persisted {@code _expanded} sub-map on each record's
 * data, keyed by field name. Lookups are batched to avoid N+1 queries.
 */
@Component
public class RelationResolver {

    public static final String EXPANDED_KEY = "_expanded";

    private final EntityRecordRepository recordRepository;

    public RelationResolver(EntityRecordRepository recordRepository) {
        this.recordRepository = recordRepository;
    }

    public void expand(List<EntityRecord> records, EntityType entityType, List<String> expandFields) {
        if (expandFields == null || expandFields.isEmpty() || records.isEmpty()) {
            return;
        }
        Map<String, FieldDefinition> relationFields = new HashMap<>();
        if (entityType.getFields() != null) {
            for (FieldDefinition field : entityType.getFields()) {
                if (field.getType() == FieldType.RELATION && expandFields.contains(field.getName())) {
                    relationFields.put(field.getName(), field);
                }
            }
        }
        if (relationFields.isEmpty()) {
            return;
        }

        // Collect every referenced id across all records and fields, then batch fetch.
        Set<String> ids = new HashSet<>();
        for (EntityRecord record : records) {
            if (record.getData() == null) {
                continue;
            }
            for (String fieldName : relationFields.keySet()) {
                collectIds(record.getData().get(fieldName), ids);
            }
        }
        if (ids.isEmpty()) {
            return;
        }

        Map<String, EntityRecord> byId = new HashMap<>();
        for (EntityRecord target : recordRepository.findAllById(ids)) {
            byId.put(target.getId(), target);
        }

        for (EntityRecord record : records) {
            if (record.getData() == null) {
                continue;
            }
            Map<String, Object> expanded = new LinkedHashMap<>();
            for (String fieldName : relationFields.keySet()) {
                Object ref = record.getData().get(fieldName);
                if (ref instanceof List<?> list) {
                    List<EntityRecord> resolved = new ArrayList<>();
                    for (Object id : list) {
                        EntityRecord t = byId.get(String.valueOf(id));
                        if (t != null) {
                            resolved.add(t);
                        }
                    }
                    expanded.put(fieldName, resolved);
                } else if (ref != null) {
                    expanded.put(fieldName, byId.get(ref.toString()));
                }
            }
            if (!expanded.isEmpty()) {
                record.getData().put(EXPANDED_KEY, expanded);
            }
        }
    }

    private void collectIds(Object ref, Set<String> ids) {
        if (ref instanceof List<?> list) {
            for (Object id : list) {
                if (id != null) {
                    ids.add(id.toString());
                }
            }
        } else if (ref != null) {
            ids.add(ref.toString());
        }
    }
}
