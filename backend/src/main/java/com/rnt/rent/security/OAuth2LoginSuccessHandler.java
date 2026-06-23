package com.rnt.rent.security;

import com.rnt.rent.entity.Tenant;
import com.rnt.rent.repository.TenantRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TenantRepository tenantRepository;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauth2User = oauthToken.getPrincipal();

        String registrationId = oauthToken.getAuthorizedClientRegistrationId();
        String username = null;
        String tenantName = null;

        if ("google".equals(registrationId)) {
            username = oauth2User.getAttribute("email");
            tenantName = oauth2User.getAttribute("name");
        } else if ("github".equals(registrationId)) {
            username = oauth2User.getAttribute("login");
            if (username == null) {
                username = oauth2User.getAttribute("email");
            }
            tenantName = oauth2User.getAttribute("name");
            if (tenantName == null) {
                tenantName = username;
            }
        }

        if (username == null) {
            response.sendRedirect(frontendUrl + "/?error=oauth2_missing_email");
            return;
        }

        Optional<Tenant> tenantOpt = tenantRepository.findByUsername(username);
        Tenant tenant;
        if (tenantOpt.isEmpty()) {
            tenant = new Tenant();
            tenant.setUsername(username);
            tenant.setTenantName(tenantName != null ? tenantName : username);
            // Default password, since login will be via OAuth
            tenant.setPassword("");
            tenantRepository.save(tenant);
        } else {
            tenant = tenantOpt.get();
        }

        String token = jwtUtil.generateToken(tenant.getUsername(), tenant.getTenantName());

        String redirectUrl = frontendUrl + "/?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
