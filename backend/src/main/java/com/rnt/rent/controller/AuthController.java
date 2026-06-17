package com.rnt.rent.controller;

import com.rnt.rent.entity.Tenant;
import com.rnt.rent.repository.TenantRepository;
import com.rnt.rent.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerTenant(@RequestBody Tenant tenant) {
        if (tenantRepository.findByUsername(tenant.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        tenant.setPassword(passwordEncoder.encode(tenant.getPassword()));

        // Use a default tenantName based on username if not provided
        if (tenant.getTenantName() == null || tenant.getTenantName().isEmpty()) {
             tenant.setTenantName("tenant_" + tenant.getUsername());
        }

        Tenant savedTenant = tenantRepository.save(tenant);
        return ResponseEntity.ok(savedTenant);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Tenant loginRequest) {
        Optional<Tenant> tenantOpt = tenantRepository.findByUsername(loginRequest.getUsername());

        if (tenantOpt.isPresent() && passwordEncoder.matches(loginRequest.getPassword(), tenantOpt.get().getPassword())) {
            Tenant tenant = tenantOpt.get();
            String token = jwtUtil.generateToken(tenant.getUsername(), tenant.getTenantName());

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }
}
