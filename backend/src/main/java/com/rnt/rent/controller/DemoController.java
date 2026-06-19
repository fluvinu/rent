package com.rnt.rent.controller;

import com.rnt.rent.service.DemoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
public class DemoController {

    @Autowired
    private DemoService demoService;

    @PostMapping("/seed")
    public ResponseEntity<Map<String, Object>> seedDemoData() {
        Map<String, Object> response = demoService.seedDemoData();
        return ResponseEntity.ok(response);
    }
}
