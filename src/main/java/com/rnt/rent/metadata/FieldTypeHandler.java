package com.rnt.rent.metadata;

import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;

/**
 * Per-field-type behavior. Adding a new field type means adding one handler;
 * no changes to the validator, query translator, or schema migrations.
 */
public interface FieldTypeHandler {

    FieldType type();

    /**
     * Convert a raw incoming value (e.g. a numeric string) into the canonical
     * stored representation for this field type. Returns null for null input.
     * Throws {@link ValidationException} if the value cannot be coerced.
     */
    Object coerce(Object raw, FieldDefinition field);

    /**
     * Validate an already-coerced value against the field's configuration.
     * Throws {@link ValidationException} on failure. Required/null handling is
     * performed by {@link MetadataValidator} before this is called.
     */
    void validate(Object value, FieldDefinition field);
}
