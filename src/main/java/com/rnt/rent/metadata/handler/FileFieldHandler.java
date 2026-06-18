package com.rnt.rent.metadata.handler;

import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import com.rnt.rent.metadata.FieldTypeHandler;
import com.rnt.rent.metadata.ValidationException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * FILE fields store a file descriptor object ({fileId, name, size, mime, url})
 * or a list of them when multiple is enabled. Blob bytes live in object storage.
 */
@Component
public class FileFieldHandler implements FieldTypeHandler {

    @Override
    public FieldType type() {
        return FieldType.FILE;
    }

    @Override
    public Object coerce(Object raw, FieldDefinition field) {
        return raw;
    }

    @Override
    public void validate(Object value, FieldDefinition field) {
        if (value instanceof List<?> list) {
            for (Object item : list) {
                assertDescriptor(item);
            }
        } else {
            assertDescriptor(value);
        }
    }

    private void assertDescriptor(Object value) {
        if (!(value instanceof Map<?, ?> m) || !m.containsKey("fileId")) {
            throw new ValidationException("must be a file descriptor with a fileId");
        }
    }
}
