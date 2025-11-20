package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Crime;
import com.example.demo.model.User;
import com.example.demo.repository.CrimeRepository;

@Service
public class CrimeService {

    private final CrimeRepository crimeRepository;

    @Autowired
    public CrimeService(CrimeRepository crimeRepository) {
        this.crimeRepository = crimeRepository;
    }

    public Crime saveCrime(Crime crime) {
        return crimeRepository.save(crime);
    }

    public List<Crime> getAllCrimes() {
        return crimeRepository.findAll();
    }

    public Crime getCrimeById(Long id) {
        return crimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crime not found with id: " + id));
    }

    // ✅ Handle deletion properly
    public void deleteCrime(Long id) {
        if (!crimeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Crime not found with id: " + id);
        }
        crimeRepository.deleteById(id);
    }

    // ✅ Ensure this method is correctly calling CrimeRepository
    public List<Crime> getCrimesByUser(User user) {
        return crimeRepository.findByReportedBy(user);
    }

    // ✅ Fixed method name to match CrimeController.java
    public List<Crime> getCrimesWithinRadius(double userLat, double userLon) { // ✅ Corrected method name
        double R = 6371; // Radius of Earth in km
        return crimeRepository.findAll().stream()
            .filter(crime -> {
                double crimeLat = crime.getLatitude();
                double crimeLon = crime.getLongitude();
                double dLat = Math.toRadians(crimeLat - userLat);
                double dLon = Math.toRadians(crimeLon - userLon);
                double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                           Math.cos(Math.toRadians(userLat)) * Math.cos(Math.toRadians(crimeLat)) *
                           Math.sin(dLon / 2) * Math.sin(dLon / 2);
                double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                double distance = R * c;
                return distance <= 1; // Filter crimes within 1km radius
            })
            .collect(Collectors.toList());
    }

    public Crime updateCrimeStatus(Long crimeId, String status) {
        Crime crime = getCrimeById(crimeId);
        crime.setStatus(status);
        return crimeRepository.save(crime);
    }
}
