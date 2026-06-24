package com.rnt.rent.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class WebhookService {

    private static final Logger log = LoggerFactory.getLogger(WebhookService.class);
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public WebhookService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    private boolean isAllowedUrl(String url) {
        try {
            URI uri = URI.create(url);
            String host = uri.getHost();
            if (host == null) {
                return false;
            }
            // Basic SSRF protection: block localhost, loopback, link-local, site-local
            java.net.InetAddress addr = java.net.InetAddress.getByName(host);
            if (addr.isAnyLocalAddress() || addr.isLoopbackAddress() ||
                addr.isLinkLocalAddress() || addr.isSiteLocalAddress()) {
                return false;
            }
            // Explicitly block common cloud metadata endpoints
            if (host.equals("169.254.169.254")) {
                return false;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public void sendWebhook(String url, Object payload) {
        if (!isAllowedUrl(url)) {
            log.warn("Webhook URL is not allowed due to SSRF protection: {}", url);
            return;
        }

        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(response -> {
                        if (response.statusCode() >= 200 && response.statusCode() < 300) {
                            log.info("Webhook delivered successfully to {}", url);
                        } else {
                            log.warn("Webhook delivered to {} returned status {}", url, response.statusCode());
                        }
                    })
                    .exceptionally(ex -> {
                        log.error("Failed to deliver webhook to {}", url, ex);
                        return null;
                    });
        } catch (Exception e) {
            log.error("Failed to prepare webhook for {}", url, e);
        }
    }
}
