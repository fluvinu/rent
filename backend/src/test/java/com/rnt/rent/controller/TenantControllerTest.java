package com.rnt.rent.controller;

import com.rnt.rent.entity.Tenant;
import com.rnt.rent.repository.TenantRepository;
import com.rnt.rent.tenant.TenantContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class TenantControllerTest {

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private TenantController tenantController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("testuser", "password")
        );
        TenantContext.setTenantId("test_tenant");
    }

    @Test
    public void testGetProfile() {
        Tenant tenant = new Tenant("testuser", "password", "test_tenant");
        tenant.setHeadingName("Test Heading");
        when(tenantRepository.findByUsername("testuser")).thenReturn(Optional.of(tenant));

        ResponseEntity<?> response = tenantController.getProfile();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals("testuser", body.get("username"));
        assertEquals("Test Heading", body.get("headingName"));

        // Ensure context was restored
        assertEquals("test_tenant", TenantContext.getTenantId());
    }

    @Test
    public void testUpdateProfile() {
        Tenant tenant = new Tenant("testuser", "password", "test_tenant");
        when(tenantRepository.findByUsername("testuser")).thenReturn(Optional.of(tenant));

        Map<String, String> updateRequest = new HashMap<>();
        updateRequest.put("headingName", "Updated Heading");

        ResponseEntity<?> response = tenantController.updateProfile(updateRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals("Updated Heading", body.get("headingName"));
        verify(tenantRepository, times(1)).save(tenant);

        // Ensure context was restored
        assertEquals("test_tenant", TenantContext.getTenantId());
    }
}
