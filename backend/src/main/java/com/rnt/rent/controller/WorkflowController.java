package com.rnt.rent.controller;

import com.rnt.rent.entity.Workflow;
import com.rnt.rent.repository.WorkflowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    @Autowired
    private WorkflowRepository workflowRepository;

    @GetMapping("/entity/{entityTypeId}")
    public List<Workflow> getByEntityType(@PathVariable String entityTypeId) {
        return workflowRepository.findByEntityTypeId(entityTypeId);
    }

    @PostMapping("/entity/{entityTypeId}")
    public Workflow create(@PathVariable String entityTypeId, @RequestBody Workflow workflow) {
        workflow.setEntityTypeId(entityTypeId);
        return workflowRepository.save(workflow);
    }

    @GetMapping("/{id}")
    public Workflow getById(@PathVariable String id) {
        return workflowRepository.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public Workflow update(@PathVariable String id, @RequestBody Workflow workflow) {
        workflow.setId(id);
        return workflowRepository.save(workflow);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        workflowRepository.deleteById(id);
    }
}
