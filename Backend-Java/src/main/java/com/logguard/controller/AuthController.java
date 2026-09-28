package com.logguard.controller;

import com.logguard.model.User;
import com.logguard.repository.mongo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowedHeaders = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (userRepo.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User already exists"));
        }
        User user = new User();
        user.setName(body.get("name"));
        user.setEmail(email);
        user.setPassword(body.get("password"));
        user.setRole("admin"); // first user is admin
        userRepo.save(user);
    
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Registered");
        res.put("email", user.getEmail());
        res.put("name", user.getName());
        res.put("role", user.getRole());
        res.put("token", "dummy-jwt-token-" + user.getId());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        Optional<User> opt = userRepo.findByEmail(email);
        if (opt.isEmpty() || !opt.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        User user = opt.get();
        if (user.getRole() == null) user.setRole("admin");
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Login success");
        res.put("email", user.getEmail());
        res.put("name", user.getName());
        res.put("role", user.getRole());
        res.put("token", "dummy-jwt-token-" + user.getId());
        return ResponseEntity.ok(res);
}

    @GetMapping("/me")
    public Map<String, String> me() {
        return Map.of("email", "kodalisuchitrakamala@gmail.com", "role", "admin", "name", "Admin");
    }
}