package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Crime;
import com.example.demo.model.User;
import com.example.demo.service.CrimeService;

@RestController
@RequestMapping("/api/crimes")
public class CrimeController {

    private final CrimeService crimeService;

    @Autowired
    public CrimeController(CrimeService crimeService) {
        this.crimeService = crimeService;
    }

    @GetMapping
    public List<Crime> getAllCrimes() {
        return crimeService.getAllCrimes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Crime> getCrimeById(@PathVariable Long id) {
        Crime crime = crimeService.getCrimeById(id);
        if (crime == null) {
            throw new ResourceNotFoundException("Crime not found with id: " + id);
        }
        return ResponseEntity.ok(crime);
    }

    @PostMapping
    public ResponseEntity<?> createCrime(@RequestBody Crime crime) {
        if (crime.getLatitude() == null || crime.getLongitude() == null) {
            return ResponseEntity.badRequest().body("Geolocation is required to report a crime.");
        }

        Crime savedCrime = crimeService.saveCrime(crime);
        return ResponseEntity.ok(savedCrime);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCrime(@PathVariable Long id) {
        crimeService.deleteCrime(id);
        return ResponseEntity.ok().build();
    }

    // ✅ Fixed: Get crimes by user
    @GetMapping("/user/{userId}")
    public List<Crime> getCrimesByUser(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId);
        return crimeService.getCrimesByUser(user);
    }

    // ✅ Fixed: Corrected method to match CrimeService.java
    @GetMapping("/nearby")
    public List<Crime> getNearbyCrimes(@RequestParam double latitude, @RequestParam double longitude) {
        return crimeService.getCrimesWithinRadius(latitude, longitude); // ✅ Matching method name
    }
}
