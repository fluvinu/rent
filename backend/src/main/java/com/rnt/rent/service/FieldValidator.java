package com.rnt.rent.service;

import com.rnt.rent.entity.EntityType;
import com.rnt.rent.entity.EntityType.FieldDefinition;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Validates and coerces a record's {@code data} map against the field
 * definitions of its {@link EntityType}. Relation/file existence checks live in
 * {@link RelationService}; this class handles shape, type and constraint rules.
 */
@Component
public class FieldValidator {

    /** Returns a coerced copy of {@code data} keyed by field key, or throws on violation. */
    public Map<String, Object> validateAndCoerce(Map<String, Object> data, EntityType type) {
        Map<String, Object> input = data == null ? Map.of() : data;
        Map<String, Object> out = new LinkedHashMap<>();
        List<FieldDefinition> fields = type.getFields() == null ? List.of() : type.getFields();

        for (FieldDefinition field : fields) {
            Object value = input.containsKey(field.getKey()) ? input.get(field.getKey())
                    : input.get(field.getName()); // tolerate name-keyed payloads

            if (value == null || (value instanceof String s && s.isEmpty())) {
                if (field.getDefaultValue() != null) {
                    value = field.getDefaultValue();
                } else if (field.isRequired()) {
                    throw new IllegalArgumentException("Missing required field: " + field.getName());
                } else {
                    continue;
                }
            }
            out.put(field.getKey(), coerce(value, field));
        }
        return out;
    }

    private Object coerce(Object value, FieldDefinition field) {
        return switch (field.getType()) {
            case TEXT -> validateText(value, field);
            case NUMBER -> validateNumber(value, field);
            case BOOLEAN -> validateBoolean(value, field);
            case DATE -> validateDate(value, field);
            case SELECT -> validateSelect(value, field);
            case MULTI_SELECT -> validateMultiSelect(value, field);
            case RELATION -> validateRelationShape(value, field);
            case FILE, JSON -> value;
        };
    }

    private String validateText(Object value, FieldDefinition field) {
        String s = String.valueOf(value);
        Object maxLength = config(field, "maxLength");
        if (maxLength instanceof Number max && s.length() > max.intValue()) {
            throw new IllegalArgumentException(field.getName() + " exceeds maxLength " + max.intValue());
        }
        Object regex = config(field, "regex");
        if (regex instanceof String pattern && !pattern.isEmpty() && !s.matches(pattern)) {
            throw new IllegalArgumentException(field.getName() + " does not match required format");
        }
        return s;
    }

    private Double validateNumber(Object value, FieldDefinition field) {
        double d;
        try {
            d = value instanceof Number n ? n.doubleValue() : Double.parseDouble(String.valueOf(value));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(field.getName() + " must be a number");
        }
        Object min = config(field, "min");
        Object max = config(field, "max");
        if (min instanceof Number mn && d < mn.doubleValue()) {
            throw new IllegalArgumentException(field.getName() + " must be >= " + mn);
        }
        if (max instanceof Number mx && d > mx.doubleValue()) {
            throw new IllegalArgumentException(field.getName() + " must be <= " + mx);
        }
        return d;
    }

    private Boolean validateBoolean(Object value, FieldDefinition field) {
        if (value instanceof Boolean b) {
            return b;
        }
        String s = String.valueOf(value).trim().toLowerCase();
        if (s.equals("true") || s.equals("false")) {
            return Boolean.parseBoolean(s);
        }
        throw new IllegalArgumentException(field.getName() + " must be a boolean");
    }

    private String validateDate(Object value, FieldDefinition field) {
        String s = String.valueOf(value);
        try {
            // Accept ISO date or date-time; store the original string.
            if (s.length() <= 10) {
                java.time.LocalDate.parse(s, DateTimeFormatter.ISO_LOCAL_DATE);
            } else {
                java.time.OffsetDateTime.parse(s);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException(field.getName() + " must be an ISO-8601 date");
        }
        return s;
    }

    private String validateSelect(Object value, FieldDefinition field) {
        String s = String.valueOf(value);
        List<String> options = field.getOptions();
        if (options != null && !options.isEmpty() && !options.contains(s)) {
            throw new IllegalArgumentException(field.getName() + " must be one of " + options);
        }
        return s;
    }

    @SuppressWarnings("unchecked")
    private List<String> validateMultiSelect(Object value, FieldDefinition field) {
        if (!(value instanceof List<?> raw)) {
            throw new IllegalArgumentException(field.getName() + " must be a list");
        }
        List<String> result = new ArrayList<>();
        List<String> options = field.getOptions();
        for (Object item : raw) {
            String s = String.valueOf(item);
            if (options != null && !options.isEmpty() && !options.contains(s)) {
                throw new IllegalArgumentException(field.getName() + " contains invalid option: " + s);
            }
            result.add(s);
        }
        return result;
    }

    private Object validateRelationShape(Object value, FieldDefinition field) {
        boolean many = "MANY".equalsIgnoreCase(field.getRelationCardinality());
        if (many && !(value instanceof List)) {
            throw new IllegalArgumentException(field.getName() + " must be a list of record ids");
        }
        return value;
    }

    private Object config(FieldDefinition field, String key) {
        return field.getConfig() == null ? null : field.getConfig().get(key);
    }
}
