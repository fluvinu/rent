package com.rnt.rent.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rnt.rent.entity.Tenant;
import com.rnt.rent.repository.TenantRepository;
import com.rnt.rent.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth/oauth")
public class OAuthController {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${oauth.google.client-id:}")
    private String googleClientId;

    @Value("${oauth.google.client-secret:}")
    private String googleClientSecret;

    @Value("${oauth.github.client-id:}")
    private String githubClientId;

    @Value("${oauth.github.client-secret:}")
    private String githubClientSecret;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/google")
    public ResponseEntity<?> googleCallback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String redirectUri = body.get("redirectUri");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body("Missing code");
        }

        try {
            // Exchange code for tokens
            HttpHeaders tokenHeaders = new HttpHeaders();
            tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            MultiValueMap<String, String> tokenParams = new LinkedMultiValueMap<>();
            tokenParams.add("code", code);
            tokenParams.add("client_id", googleClientId);
            tokenParams.add("client_secret", googleClientSecret);
            tokenParams.add("redirect_uri", redirectUri);
            tokenParams.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(tokenParams, tokenHeaders);
            ResponseEntity<String> tokenResponse = restTemplate.postForEntity(
                "https://oauth2.googleapis.com/token", tokenRequest, String.class);

            JsonNode tokenJson = objectMapper.readTree(tokenResponse.getBody());
            String accessToken = tokenJson.get("access_token").asText();

            // Fetch user info
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
            ResponseEntity<String> userResponse = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v3/userinfo", HttpMethod.GET, userRequest, String.class);

            JsonNode userJson = objectMapper.readTree(userResponse.getBody());
            String email = userJson.get("email").asText();
            String name = userJson.has("name") ? userJson.get("name").asText() : email;
            String picture = userJson.has("picture") ? userJson.get("picture").asText() : null;

            return generateOAuthToken("google:" + email, email, name, picture);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google OAuth failed: " + e.getMessage());
        }
    }

    @PostMapping("/github")
    public ResponseEntity<?> githubCallback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String redirectUri = body.get("redirectUri");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body("Missing code");
        }

        try {
            // Exchange code for access token
            HttpHeaders tokenHeaders = new HttpHeaders();
            tokenHeaders.setContentType(MediaType.APPLICATION_JSON);
            tokenHeaders.set("Accept", "application/json");

            Map<String, String> tokenParams = new HashMap<>();
            tokenParams.put("code", code);
            tokenParams.put("client_id", githubClientId);
            tokenParams.put("client_secret", githubClientSecret);
            tokenParams.put("redirect_uri", redirectUri);

            HttpEntity<Map<String, String>> tokenRequest = new HttpEntity<>(tokenParams, tokenHeaders);
            ResponseEntity<String> tokenResponse = restTemplate.postForEntity(
                "https://github.com/login/oauth/access_token", tokenRequest, String.class);

            JsonNode tokenJson = objectMapper.readTree(tokenResponse.getBody());
            String accessToken = tokenJson.get("access_token").asText();

            // Fetch user info
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);
            userHeaders.set("User-Agent", "Rent-App");
            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
            ResponseEntity<String> userResponse = restTemplate.exchange(
                "https://api.github.com/user", HttpMethod.GET, userRequest, String.class);

            JsonNode userJson = objectMapper.readTree(userResponse.getBody());
            String login = userJson.get("login").asText();
            String name = userJson.has("name") && !userJson.get("name").isNull()
                ? userJson.get("name").asText() : login;
            String avatarUrl = userJson.has("avatar_url") ? userJson.get("avatar_url").asText() : null;

            // Try to get email (may be null if private)
            String email = null;
            if (userJson.has("email") && !userJson.get("email").isNull()) {
                email = userJson.get("email").asText();
            }
            String identifier = "github:" + login;

            return generateOAuthToken(identifier, email != null ? email : login, name, avatarUrl);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("GitHub OAuth failed: " + e.getMessage());
        }
    }

    private ResponseEntity<?> generateOAuthToken(String oauthId, String username, String displayName, String avatarUrl) {
        // Find existing tenant by oauthId stored as username
        Optional<Tenant> existing = tenantRepository.findByUsername(oauthId);
        Tenant tenant;
        if (existing.isPresent()) {
            tenant = existing.get();
        } else {
            // Create new tenant for SSO user
            tenant = new Tenant();
            tenant.setUsername(oauthId);
            tenant.setPassword(UUID.randomUUID().toString()); // random unusable password
            tenant.setTenantName(displayName);
            if (avatarUrl != null) {
                tenant.setLogoUrl(avatarUrl);
            }
            tenant = tenantRepository.save(tenant);
        }

        String token = jwtUtil.generateToken(tenant.getUsername(), tenant.getTenantName());
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return ResponseEntity.ok(response);
    }
}
