package com.rnt.rent.metadata.handler;

import com.rnt.rent.entity.EntityRecord;
import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.FieldTypeHandler;
import com.rnt.rent.metadata.ValidationException;
import com.rnt.rent.repository.EntityRecordRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * RELATION fields store the target record id (to-one) or a list of ids
 * (to-many). Validation checks every referenced record exists in the current
 * tenant and belongs to the declared target entity type.
 */
@Component
public class RelationFieldHandler implements FieldTypeHandler {

    private final EntityRecordRepository recordRepository;

    public RelationFieldHandler(EntityRecordRepository recordRepository) {
        this.recordRepository = recordRepository;
    }

    @Override
    public FieldType type() {
        return FieldType.RELATION;
    }

    @Override
    public Object coerce(Object raw, FieldDefinition field) {
        if (raw == null) {
            return null;
        }
        if (raw instanceof List<?> list) {
            List<String> ids = new ArrayList<>();
            for (Object v : list) {
                ids.add(v == null ? null : v.toString());
            }
            return ids;
        }
        return raw.toString();
    }

    @Override
    public void validate(Object value, FieldDefinition field) {
        String targetType = field.getRelationTargetType();
        if (value instanceof List<?> ids) {
            for (Object id : ids) {
                assertTarget(id == null ? null : id.toString(), targetType);
            }
        } else {
            assertTarget(value.toString(), targetType);
        }
    }

    private void assertTarget(String recordId, String targetType) {
        if (recordId == null || recordId.isBlank()) {
            throw new ValidationException("relation target id is blank");
        }
        Optional<EntityRecord> target = recordRepository.findById(recordId);
        if (target.isEmpty()) {
            throw new ValidationException("referenced record '" + recordId + "' does not exist");
        }
        if (targetType != null && !targetType.isBlank()
                && !targetType.equals(target.get().getEntityTypeId())) {
            throw new ValidationException("referenced record '" + recordId + "' is not of the expected type");
        }
    }
}
