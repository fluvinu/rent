package com.rnt.rent.metadata;

import com.rnt.rent.entity.EntityType.FieldType;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Resolves the {@link FieldTypeHandler} for a given {@link FieldType}. Handlers
 * are discovered automatically from the Spring context, so new field types are
 * registered just by adding a handler bean.
 */
@Component
public class FieldTypeRegistry {

    private final Map<FieldType, FieldTypeHandler> handlers = new EnumMap<>(FieldType.class);

    public FieldTypeRegistry(List<FieldTypeHandler> discovered) {
        for (FieldTypeHandler handler : discovered) {
            handlers.put(handler.type(), handler);
        }
    }

    public FieldTypeHandler get(FieldType type) {
        FieldTypeHandler handler = handlers.get(type);
        if (handler == null) {
            throw new IllegalStateException("No handler registered for field type " + type);
        }
        return handler;
    }
}
