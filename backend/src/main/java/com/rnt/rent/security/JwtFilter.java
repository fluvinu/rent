package com.rnt.rent.security;

import com.rnt.rent.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        if (request.getServletPath().startsWith("/auth/") || request.getServletPath().startsWith("/api/tenant/public/")) {
            chain.doFilter(request, response);
            return;
        }

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;
        String tenantName = null;
        String role = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                tenantName = jwtUtil.extractTenantName(jwt);
                role = jwtUtil.extractRole(jwt);
            } catch (Exception e) {
                // Invalid token
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            if (jwtUtil.validateToken(jwt, username)) {
                // Set the tenant in context
                if (tenantName != null) {
                    TenantContext.setTenantId(tenantName);
                }
                TenantContext.setRole(role != null ? role : "ADMIN");

                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                        new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }

        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
