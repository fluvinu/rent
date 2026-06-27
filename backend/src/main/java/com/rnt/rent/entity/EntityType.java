package com.rnt.rent.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "entity_types")
public class EntityType {
    @Id
    private String id;
    private String name; // e.g. Customer, Task
    private String description;
    private List<FieldDefinition> fields;
    private List<String> subEntityTypes;
    private int version;

    @Data
    public static class FieldDefinition {
        private String key;  // stable, immutable storage key used in record.data
        private String name; // display label (renamable)
        private FieldType type;
        private boolean required;
        private boolean unique;
        private Object defaultValue;

        // SELECT / MULTI_SELECT allowed values
        private List<String> options;

        // RELATION: id of the target EntityType and cardinality (ONE | MANY)
        private String relationTargetType;
        private String relationCardinality;

        // Type-specific constraints (min, max, regex, maxLength, ...)
        private java.util.Map<String, Object> config;
    }

    public enum FieldType {
        TEXT, NUMBER, BOOLEAN, DATE, SELECT, MULTI_SELECT, RELATION, FILE, JSON
    }
}
