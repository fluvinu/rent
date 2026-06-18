package com.rnt.rent.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Data
@Document(collection = "entity_records")
public class EntityRecord {
    @Id
    private String id;
    private String entityTypeId;
    private Map<String, Object> data;
    private Instant createdAt;
    private Instant updatedAt;
    private long version;
}
