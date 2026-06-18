package com.rnt.rent.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rnt.rent.entity.EntityRecord;
import com.rnt.rent.entity.Workflow;
import com.rnt.rent.entity.Workflow.StepType;
import com.rnt.rent.entity.Workflow.WorkflowStep;
import com.rnt.rent.query.QueryRequest.FilterNode;
import com.rnt.rent.repository.EntityRecordRepository;
import com.rnt.rent.repository.WorkflowRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Synchronous workflow runtime. After a record mutation the owning service calls
 * {@link #onEvent}; the engine finds active workflows for the entity type, runs
 * their TRIGGER/CONDITION steps, and executes the ACTION steps in order. A
 * thread-local depth guard prevents update-triggered infinite recursion.
 *
 * The design doc describes moving this onto a queue for scale; the interface
 * stays the same so that swap is transparent.
 */
@Service
public class WorkflowEngine {

    public enum EventType { RECORD_CREATED, RECORD_UPDATED, RECORD_DELETED }

    private static final Logger log = LoggerFactory.getLogger(WorkflowEngine.class);
    private static final int MAX_DEPTH = 5;
    private static final ThreadLocal<Integer> DEPTH = ThreadLocal.withInitial(() -> 0);

    @Autowired
    private WorkflowRepository workflowRepository;

    @Autowired
    private EntityRecordRepository entityRecordRepository;

    @Autowired
    private RecordMatcher recordMatcher;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void onEvent(EventType event, String entityTypeId, EntityRecord record) {
        if (DEPTH.get() >= MAX_DEPTH) {
            log.warn("Workflow recursion limit hit for entityType={}", entityTypeId);
            return;
        }
        DEPTH.set(DEPTH.get() + 1);
        try {
            List<Workflow> workflows = workflowRepository.findByEntityTypeId(entityTypeId);
            for (Workflow wf : workflows) {
                if (wf.isActive() && triggerMatches(wf, event) && conditionsPass(wf, record)) {
                    runActions(wf, record);
                }
            }
        } catch (Exception e) {
            log.error("Workflow execution failed for entityType={}: {}", entityTypeId, e.getMessage());
        } finally {
            DEPTH.set(DEPTH.get() - 1);
        }
    }

    private boolean triggerMatches(Workflow wf, EventType event) {
        if (wf.getSteps() == null) {
            return false;
        }
        return wf.getSteps().stream()
                .filter(s -> s.getType() == StepType.TRIGGER)
                .anyMatch(s -> {
                    Object on = s.getConfiguration() == null ? null : s.getConfiguration().get("on");
                    return on != null && event.name().equalsIgnoreCase(String.valueOf(on));
                });
    }

    private boolean conditionsPass(Workflow wf, EntityRecord record) {
        if (wf.getSteps() == null) {
            return true;
        }
        for (WorkflowStep step : wf.getSteps()) {
            if (step.getType() != StepType.CONDITION || step.getConfiguration() == null) {
                continue;
            }
            Object filter = step.getConfiguration().get("filter");
            if (filter == null) {
                continue;
            }
            FilterNode node = objectMapper.convertValue(filter, FilterNode.class);
            if (!recordMatcher.matches(node, record.getData())) {
                return false;
            }
        }
        return true;
    }

    private void runActions(Workflow wf, EntityRecord record) {
        for (WorkflowStep step : wf.getSteps()) {
            if (step.getType() != StepType.ACTION || step.getConfiguration() == null) {
                continue;
            }
            String kind = String.valueOf(step.getConfiguration().get("kind"));
            switch (kind) {
                case "UPDATE_FIELD" -> updateField(step.getConfiguration(), record);
                case "CREATE_RECORD" -> createRecord(step.getConfiguration());
                case "LOG" -> log.info("Workflow '{}' LOG: {}", wf.getName(),
                        step.getConfiguration().get("message"));
                default -> log.warn("Unknown workflow action kind: {}", kind);
            }
        }
    }

    private void updateField(Map<String, Object> config, EntityRecord record) {
        Object field = config.get("field");
        if (field == null || record.getData() == null) {
            return;
        }
        record.getData().put(String.valueOf(field), config.get("value"));
        record.setUpdatedAt(java.time.Instant.now());
        entityRecordRepository.save(record);
    }

    @SuppressWarnings("unchecked")
    private void createRecord(Map<String, Object> config) {
        Object targetType = config.get("entityTypeId");
        Object data = config.get("data");
        if (targetType == null) {
            return;
        }
        EntityRecord created = new EntityRecord();
        created.setEntityTypeId(String.valueOf(targetType));
        if (data instanceof Map<?, ?> map) {
            created.setData((Map<String, Object>) map);
        }
        created.setCreatedAt(java.time.Instant.now());
        created.setUpdatedAt(java.time.Instant.now());
        entityRecordRepository.save(created);
    }
}
