package com.logguard.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.util.*;

import com.logguard.model.User;
import com.logguard.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("_id", u.getId());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("totalLogs", 0);
            m.put("stats", Map.of("CRITICAL", 0));
            return m;
        }).toList();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable String id, @RequestBody Map<String,String> body) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(body.get("role").toUpperCase());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "deleted"));
    }
}