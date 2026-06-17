package com.rnt.rent.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Data
@Document(collection = "entity_records")
public class EntityRecord {
    @Id
    private String id;
    private String entityTypeId;
    private Map<String, Object> data;
}
