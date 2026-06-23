package com.rnt.rent.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import com.rnt.rent.repository.TenantRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CorsTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TenantRepository tenantRepository;

    @Test
    public void testCorsPreflight() throws Exception {
        mockMvc.perform(options("/api/tenant/public/current?domain=rentis.netlify.app")
                .header("Origin", "https://rentis.netlify.app")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetPublicCurrent() throws Exception {
        mockMvc.perform(get("/api/tenant/public/current?domain=rentis.netlify.app")
                .header("Origin", "https://rentis.netlify.app"))
                .andExpect(status().isNotFound()); // not found since mocked repo returns empty
    }
}
