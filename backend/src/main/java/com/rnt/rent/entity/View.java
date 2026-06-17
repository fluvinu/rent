package com.rnt.rent.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@Document(collection = "views")
public class View {
    @Id
    private String id;
    private String entityTypeId;
    private String name;
    private ViewType type;

    // View specific definitions like filters, sorting, hidden fields, etc.
    private Map<String, Object> definition;

    public enum ViewType {
        TABLE, KANBAN, CALENDAR, GALLERY, LIST
    }
}
