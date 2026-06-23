package com.rnt.rent.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rnt.rent.entity.Tenant;
import com.rnt.rent.repository.TenantRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TenantRepository tenantRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testRegisterDomain() throws Exception {
        Tenant tenant = new Tenant();
        tenant.setUsername("testuser2");
        tenant.setPassword("password");
        tenant.setDomain("mytenant.com");

        when(tenantRepository.findByUsername("testuser2")).thenReturn(Optional.empty());
        when(tenantRepository.save(any(Tenant.class))).thenReturn(tenant);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tenant)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser2"))
                .andExpect(jsonPath("$.domain").value("mytenant.com"));
    }
}
