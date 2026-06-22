package com.rnt.rent.controller;

import com.rnt.rent.entity.Tenant;
import com.rnt.rent.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tenant")
public class TenantController {

    @Autowired
    private TenantRepository tenantRepository;

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<Tenant> tenantOpt = tenantRepository.findByUsername(username);
        if (tenantOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Tenant t = tenantOpt.get();
        Map<String, Object> settings = new HashMap<>();
        settings.put("headingName", t.getHeadingName());
        settings.put("logo", t.getLogo() != null ? Base64.getEncoder().encodeToString(t.getLogo()) : null);
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> payload) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<Tenant> tenantOpt = tenantRepository.findByUsername(username);
        if (tenantOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Tenant t = tenantOpt.get();
        if (payload.containsKey("headingName")) {
            t.setHeadingName(payload.get("headingName"));
        }
        if (payload.containsKey("logo")) {
            String logoBase64 = payload.get("logo");
            if (logoBase64 != null && !logoBase64.isEmpty()) {
                if (logoBase64.contains(",")) {
                    logoBase64 = logoBase64.split(",")[1];
                }
                t.setLogo(Base64.getDecoder().decode(logoBase64));
            } else {
                t.setLogo(null);
            }
        }
        tenantRepository.save(t);
        return ResponseEntity.ok().build();
    }
}
