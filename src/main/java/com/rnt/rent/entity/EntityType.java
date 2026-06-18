package com.rnt.rent.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@Document(collection = "entity_types")
public class EntityType {
    @Id
    private String id;
    private String name; // e.g. Customer, Task
    private String description;
    private List<FieldDefinition> fields;

    @Data
    public static class FieldDefinition {
        private String name;
        private FieldType type;
        private boolean required;
        private String relationTargetType; // Optional: If type is RELATION, the ID of the target EntityType

        // Type-specific configuration, e.g. SELECT options, NUMBER min/max,
        // TEXT regex/length, RELATION cardinality. Interpreted by FieldTypeHandler.
        private Map<String, Object> config;
    }

    public enum FieldType {
        TEXT, NUMBER, BOOLEAN, DATE, SELECT, MULTI_SELECT, RELATION, FILE, JSON
    }
}
