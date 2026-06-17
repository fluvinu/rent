package com.rnt.rent.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@Document(collection = "workflows")
public class Workflow {
    @Id
    private String id;
    private String entityTypeId;
    private String name;
    private boolean active;

    private List<WorkflowStep> steps;

    @Data
    public static class WorkflowStep {
        private StepType type;
        private Map<String, Object> configuration;
    }

    public enum StepType {
        TRIGGER, CONDITION, ACTION
    }
}
