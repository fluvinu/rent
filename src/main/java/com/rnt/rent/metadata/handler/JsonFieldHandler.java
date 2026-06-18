package com.rnt.rent.metadata.handler;

import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.FieldTypeHandler;
import org.springframework.stereotype.Component;

/**
 * JSON fields accept any structured value. Optional JSON-Schema validation can
 * be layered on later via field.config.schema.
 */
@Component
public class JsonFieldHandler implements FieldTypeHandler {

    @Override
    public FieldType type() {
        return FieldType.JSON;
    }

    @Override
    public Object coerce(Object raw, FieldDefinition field) {
        return raw;
    }

    @Override
    public void validate(Object value, FieldDefinition field) {
        // any structured value is accepted
    }
}
