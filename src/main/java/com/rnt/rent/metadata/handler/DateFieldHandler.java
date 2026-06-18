package com.rnt.rent.metadata.handler;

import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.FieldTypeHandler;
import com.rnt.rent.metadata.ValidationException;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;

@Component
public class DateFieldHandler implements FieldTypeHandler {

    @Override
    public FieldType type() {
        return FieldType.DATE;
    }

    @Override
    public Object coerce(Object raw, FieldDefinition field) {
        if (raw == null) {
            return null;
        }
        String s = raw.toString().trim();
        // Accept either a full ISO-8601 timestamp or a plain date; store as-is.
        try {
            OffsetDateTime.parse(s);
            return s;
        } catch (DateTimeParseException ignored) {
            // fall through
        }
        try {
            LocalDate.parse(s);
            return s;
        } catch (DateTimeParseException e) {
            throw new ValidationException("must be an ISO-8601 date or date-time");
        }
    }

    @Override
    public void validate(Object value, FieldDefinition field) {
        // parseability already enforced by coerce
    }
}
