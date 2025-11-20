package com.example.demo.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private final String adminUsername;
    private final String adminPassword;
    private final Map<String, Long> activeTokens = new ConcurrentHashMap<>();

    public AdminAuthService(
            @Value("${admin.credentials.username:admin}") String adminUsername,
            @Value("${admin.credentials.password:admin@1787}") String adminPassword) {
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    public String login(String username, String password) {
        if (adminUsername.equals(username) && adminPassword.equals(password)) {
            String token = UUID.randomUUID().toString();
            activeTokens.put(token, System.currentTimeMillis());
            return token;
        }
        throw new RuntimeException("Invalid admin credentials");
    }

    public boolean isTokenValid(String token) {
        return token != null && activeTokens.containsKey(token);
    }

    public void logout(String token) {
        if (token != null) {
            activeTokens.remove(token);
        }
    }
}

