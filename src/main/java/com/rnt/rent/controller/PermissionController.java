package com.rnt.rent.controller;

import com.rnt.rent.entity.Permission;
import com.rnt.rent.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    @Autowired
    private PermissionRepository permissionRepository;

    @GetMapping
    public List<Permission> getAll() {
        return permissionRepository.findAll();
    }

    @PostMapping
    public Permission create(@RequestBody Permission permission) {
        return permissionRepository.save(permission);
    }

    @GetMapping("/{id}")
    public Permission getById(@PathVariable String id) {
        return permissionRepository.findById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public Permission update(@PathVariable String id, @RequestBody Permission permission) {
        permission.setId(id);
        return permissionRepository.save(permission);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        permissionRepository.deleteById(id);
    }
}
