package com.rnt.rent.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "permissions")
public class Permission {
    @Id
    private String id;
    private String role; // e.g. ADMIN, USER, MANAGER
    private String entityTypeId; // Nullable if applies to all

    // permissions details like read, write, delete, or field-level specific access
    private boolean canCreate;
    private boolean canRead;
    private boolean canUpdate;
    private boolean canDelete;

    private List<String> readableFields; // Null or empty implies all
    private List<String> writableFields; // Null or empty implies all
}
