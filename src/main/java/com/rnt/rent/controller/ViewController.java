package com.rnt.rent.controller;

import com.rnt.rent.entity.View;
import com.rnt.rent.repository.ViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/views")
public class ViewController {

    @Autowired
    private ViewRepository viewRepository;

    @GetMapping("/entity/{entityTypeId}")
    public List<View> getByEntityType(@PathVariable String entityTypeId) {
        return viewRepository.findByEntityTypeId(entityTypeId);
    }

    @PostMapping("/entity/{entityTypeId}")
    public View create(@PathVariable String entityTypeId, @RequestBody View view) {
        view.setEntityTypeId(entityTypeId);
        return viewRepository.save(view);
    }

    @GetMapping("/{id}")
    public View getById(@PathVariable String id) {
        return viewRepository.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public View update(@PathVariable String id, @RequestBody View view) {
        view.setId(id);
        return viewRepository.save(view);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        viewRepository.deleteById(id);
    }
}
