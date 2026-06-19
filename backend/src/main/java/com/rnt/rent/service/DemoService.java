package com.rnt.rent.service;

import com.rnt.rent.entity.EntityRecord;
import com.rnt.rent.entity.EntityType;
import com.rnt.rent.entity.EntityType.FieldDefinition;
import com.rnt.rent.entity.EntityType.FieldType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DemoService {

    @Autowired
    private MetadataService metadataService;

    @Autowired
    private EntityRecordService entityRecordService;

    public Map<String, Object> seedDemoData() {
        Map<String, Object> response = new HashMap<>();

        // 1. Create 'Customer' EntityType
        EntityType customerType = new EntityType();
        customerType.setName("Customer");
        customerType.setDescription("Demo Customer Entity");

        FieldDefinition nameField = new FieldDefinition();
        nameField.setName("Name");
        nameField.setType(FieldType.TEXT);
        nameField.setRequired(true);

        FieldDefinition emailField = new FieldDefinition();
        emailField.setName("Email");
        emailField.setType(FieldType.TEXT);

        FieldDefinition activeField = new FieldDefinition();
        activeField.setName("Is Active");
        activeField.setType(FieldType.BOOLEAN);

        customerType.setFields(Arrays.asList(nameField, emailField, activeField));
        customerType = metadataService.create(customerType);
        String customerTypeId = customerType.getId();

        // 2. Create 'Project' EntityType
        EntityType projectType = new EntityType();
        projectType.setName("Project");
        projectType.setDescription("Demo Project Entity");

        FieldDefinition projectName = new FieldDefinition();
        projectName.setName("Project Name");
        projectName.setType(FieldType.TEXT);
        projectName.setRequired(true);

        FieldDefinition statusField = new FieldDefinition();
        statusField.setName("Status");
        statusField.setType(FieldType.SELECT);
        statusField.setOptions(Arrays.asList("Planning", "In Progress", "Completed", "On Hold"));

        FieldDefinition customerRel = new FieldDefinition();
        customerRel.setName("Customer");
        customerRel.setType(FieldType.RELATION);
        customerRel.setRelationTargetType(customerTypeId);
        customerRel.setRelationCardinality("ONE");

        projectType.setFields(Arrays.asList(projectName, statusField, customerRel));
        projectType = metadataService.create(projectType);
        String projectTypeId = projectType.getId();

        // 3. Create 'Task' EntityType
        EntityType taskType = new EntityType();
        taskType.setName("Task");
        taskType.setDescription("Demo Task Entity");

        FieldDefinition taskTitle = new FieldDefinition();
        taskTitle.setName("Title");
        taskTitle.setType(FieldType.TEXT);
        taskTitle.setRequired(true);

        FieldDefinition projectRel = new FieldDefinition();
        projectRel.setName("Project");
        projectRel.setType(FieldType.RELATION);
        projectRel.setRelationTargetType(projectTypeId);
        projectRel.setRelationCardinality("ONE");

        FieldDefinition priority = new FieldDefinition();
        priority.setName("Priority");
        priority.setType(FieldType.NUMBER);

        taskType.setFields(Arrays.asList(taskTitle, projectRel, priority));
        taskType = metadataService.create(taskType);
        String taskTypeId = taskType.getId();

        // Populate Records

        // Customer Records
        EntityRecord customer1 = new EntityRecord();
        customer1.setEntityTypeId(customerTypeId);
        customer1.setData(Map.of("name", "Acme Corp", "email", "contact@acme.com", "is_active", true));
        customer1 = entityRecordService.create(customerTypeId, customer1);

        EntityRecord customer2 = new EntityRecord();
        customer2.setEntityTypeId(customerTypeId);
        customer2.setData(Map.of("name", "Globex", "email", "info@globex.com", "is_active", false));
        customer2 = entityRecordService.create(customerTypeId, customer2);

        // Project Records
        EntityRecord project1 = new EntityRecord();
        project1.setEntityTypeId(projectTypeId);
        project1.setData(Map.of("project_name", "Website Redesign", "status", "In Progress", "customer", customer1.getId()));
        project1 = entityRecordService.create(projectTypeId, project1);

        EntityRecord project2 = new EntityRecord();
        project2.setEntityTypeId(projectTypeId);
        project2.setData(Map.of("project_name", "Database Migration", "status", "Planning", "customer", customer2.getId()));
        project2 = entityRecordService.create(projectTypeId, project2);

        // Task Records
        EntityRecord task1 = new EntityRecord();
        task1.setEntityTypeId(taskTypeId);
        task1.setData(Map.of("title", "Design mockups", "project", project1.getId(), "priority", 1));
        entityRecordService.create(taskTypeId, task1);

        EntityRecord task2 = new EntityRecord();
        task2.setEntityTypeId(taskTypeId);
        task2.setData(Map.of("title", "Setup backend", "project", project1.getId(), "priority", 2));
        entityRecordService.create(taskTypeId, task2);

        EntityRecord task3 = new EntityRecord();
        task3.setEntityTypeId(taskTypeId);
        task3.setData(Map.of("title", "Schema design", "project", project2.getId(), "priority", 1));
        entityRecordService.create(taskTypeId, task3);

        response.put("message", "Demo data seeded successfully.");
        response.put("entityTypes", List.of(customerType, projectType, taskType));

        return response;
    }
}
