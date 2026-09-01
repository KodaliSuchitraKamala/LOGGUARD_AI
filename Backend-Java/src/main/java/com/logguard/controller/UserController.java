package com.logguard.controller;

import com.logguard.model.User;
import com.logguard.repository.mongo.UserRepository;
import com.logguard.repository.mongo.LogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private LogRepository logRepository;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        long totalLogsInSystem = logRepository.count();
        
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("_id", u.getId());
            map.put("id", u.getId());
            map.put("email", u.getEmail());
            map.put("role", u.getRole() != null ? u.getRole() : "user");
            // Since Log has no userId, show total system logs for all
            map.put("totalLogs", totalLogsInSystem);
            map.put("critical", 0);
            map.put("stats", Map.of("CRITICAL", 0));
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable String id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id).map(user -> {
            user.setRole(body.get("role"));
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
}