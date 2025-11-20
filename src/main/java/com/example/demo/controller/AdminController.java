package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Crime;
import com.example.demo.service.AdminAuthService;
import com.example.demo.service.CrimeService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminAuthService adminAuthService;
    private final CrimeService crimeService;

    public AdminController(AdminAuthService adminAuthService, CrimeService crimeService) {
        this.adminAuthService = adminAuthService;
        this.crimeService = crimeService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");
            String token = adminAuthService.login(username, password);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "Admin login successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("X-Admin-Token") String token) {
        adminAuthService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Admin logged out"));
    }

    @GetMapping("/crimes")
    public ResponseEntity<?> getAllCrimes(@RequestHeader("X-Admin-Token") String token) {
        if (!adminAuthService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid admin token"));
        }
        List<Crime> crimes = crimeService.getAllCrimes();
        return ResponseEntity.ok(crimes);
    }

    @PatchMapping("/crimes/status")
    public ResponseEntity<?> updateCrimeStatus(
            @RequestHeader("X-Admin-Token") String token,
            @RequestParam Long crimeId,
            @RequestParam String status) {

        if (!adminAuthService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid admin token"));
        }

        try {
            Crime updatedCrime = crimeService.updateCrimeStatus(crimeId, status);
            return ResponseEntity.ok(updatedCrime);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/crimes/{crimeId}")
    public ResponseEntity<?> deleteCrime(
            @RequestHeader("X-Admin-Token") String token,
            @PathVariable Long crimeId) {
        if (!adminAuthService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid admin token"));
        }

        try {
            crimeService.deleteCrime(crimeId);
            return ResponseEntity.ok(Map.of("message", "Crime deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}

