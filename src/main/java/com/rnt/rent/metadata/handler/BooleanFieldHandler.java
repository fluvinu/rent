package com.rnt.rent.metadata.handler;

import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.FieldTypeHandler;
import com.rnt.rent.metadata.ValidationException;
import org.springframework.stereotype.Component;

@Component
public class BooleanFieldHandler implements FieldTypeHandler {

    @Override
    public FieldType type() {
        return FieldType.BOOLEAN;
    }

    @Override
    public Object coerce(Object raw, FieldDefinition field) {
        if (raw == null) {
            return null;
        }
        if (raw instanceof Boolean b) {
            return b;
        }
        String s = raw.toString().trim().toLowerCase();
        if (s.equals("true")) {
            return Boolean.TRUE;
        }
        if (s.equals("false")) {
            return Boolean.FALSE;
        }
        throw new ValidationException("must be a boolean");
    }

    @Override
    public void validate(Object value, FieldDefinition field) {
        // type already guaranteed by coerce
    }
}
