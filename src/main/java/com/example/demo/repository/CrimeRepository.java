package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Crime;
import com.example.demo.model.User;

public interface CrimeRepository extends JpaRepository<Crime, Long> {
    List<Crime> findByReportedBy(User user); // ✅ Ensure this method exists
}
