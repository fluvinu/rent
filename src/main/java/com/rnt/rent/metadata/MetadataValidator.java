package com.rnt.rent.metadata;

import com.rnt.rent.entity.EntityType;
import com.rnt.rent.entity.EntityType.FieldDefinition;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Validates and normalizes a record's dynamic data against its EntityType
 * metadata. Replaces ad-hoc required-only checks with per-type coercion and
 * validation delegated to {@link FieldTypeHandler}s, and rejects unknown fields.
 */
@Component
public class MetadataValidator {

    private final FieldTypeRegistry registry;

    public MetadataValidator(FieldTypeRegistry registry) {
        this.registry = registry;
    }

    /**
     * Returns a new, coerced data map. Throws {@link ValidationException}
     * aggregating every field error.
     */
    public Map<String, Object> validateAndCoerce(Map<String, Object> data, EntityType entityType) {
        Map<String, Object> input = data == null ? Map.of() : data;
        List<FieldDefinition> fields = entityType.getFields() == null ? List.of() : entityType.getFields();

        Map<String, FieldDefinition> byName = new HashMap<>();
        for (FieldDefinition field : fields) {
            byName.put(field.getName(), field);
        }

        ValidationException errors = new ValidationException(List.of());
        Map<String, Object> coerced = new HashMap<>();

        for (String key : input.keySet()) {
            if (!byName.containsKey(key)) {
                errors.add(key, "unknown field");
            }
        }

        for (FieldDefinition field : fields) {
            String name = field.getName();
            boolean present = input.containsKey(name) && input.get(name) != null;

            if (!present) {
                if (field.isRequired()) {
                    errors.add(name, "is required");
                }
                continue;
            }

            try {
                FieldTypeHandler handler = registry.get(field.getType());
                Object value = handler.coerce(input.get(name), field);
                if (value == null) {
                    if (field.isRequired()) {
                        errors.add(name, "is required");
                    }
                    continue;
                }
                handler.validate(value, field);
                coerced.put(name, value);
            } catch (ValidationException ve) {
                errors.add(name, ve.getMessage());
            }
        }

        if (errors.hasErrors()) {
            throw errors;
        }
        return coerced;
    }
}
