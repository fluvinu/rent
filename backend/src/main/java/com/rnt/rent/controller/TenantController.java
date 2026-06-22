package com.rnt.rent.controller;

import com.rnt.rent.entity.Tenant;
import com.rnt.rent.repository.TenantRepository;
import com.rnt.rent.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/tenant")
public class TenantController {

    @Autowired
    private TenantRepository tenantRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<Tenant> tenantOpt = tenantRepository.findByUsername(username);
        if (tenantOpt.isPresent()) {
            Tenant t = tenantOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", t.getId());
            response.put("username", t.getUsername());
            response.put("tenantName", t.getTenantName());
            response.put("headingName", t.getHeadingName());

            if (t.getLogo() != null && t.getLogoContentType() != null) {
                String base64Image = Base64.getEncoder().encodeToString(t.getLogo());
                String dataUrl = "data:" + t.getLogoContentType() + ";base64," + base64Image;
                response.put("logoUrl", dataUrl);
            }
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tenant not found");
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updateRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<Tenant> tenantOpt = tenantRepository.findByUsername(username);
        if (tenantOpt.isPresent()) {
            Tenant t = tenantOpt.get();
            String logoUrl = updateRequest.get("logoUrl");
            if (logoUrl != null && !logoUrl.isEmpty()) {
                try {
                    // format: data:image/png;base64,iVBORw0KGgo...
                    String[] parts = logoUrl.split(",");
                    if (parts.length == 2 && parts[0].startsWith("data:")) {
                        String contentType = parts[0].substring(5, parts[0].indexOf(";"));
                        byte[] logoBytes = Base64.getDecoder().decode(parts[1]);
                        t.setLogo(logoBytes);
                        t.setLogoContentType(contentType);
                    }
                } catch (Exception e) {
                    // Ignore invalid base64
                    e.printStackTrace();
                }
            } else if (logoUrl != null && logoUrl.isEmpty()) {
                 t.setLogo(null);
                 t.setLogoContentType(null);
            }

            if (updateRequest.containsKey("headingName")) {
                t.setHeadingName(updateRequest.get("headingName"));
            }

            tenantRepository.save(t);

            Map<String, Object> response = new HashMap<>();
            response.put("id", t.getId());
            response.put("username", t.getUsername());
            response.put("tenantName", t.getTenantName());
            response.put("headingName", t.getHeadingName());
            if (t.getLogo() != null && t.getLogoContentType() != null) {
                String base64Image = Base64.getEncoder().encodeToString(t.getLogo());
                String dataUrl = "data:" + t.getLogoContentType() + ";base64," + base64Image;
                response.put("logoUrl", dataUrl);
            }
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tenant not found");
    }
}
