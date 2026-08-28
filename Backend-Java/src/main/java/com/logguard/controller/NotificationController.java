package com.logguard.controller;

import com.logguard.model.Notification;
import com.logguard.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowedHeaders = "*", allowCredentials = "true")
public class NotificationController {

    @Autowired private NotificationRepository notificationRepo;

    @GetMapping
    public List<Notification> getAll() {
        List<Notification> all = notificationRepo.findAll();
        Collections.reverse(all);
        return all;
    }

    @PutMapping({"/read-all", "/mark-all-read"})
    public ResponseEntity<?> markAllRead() {
        List<Notification> all = notificationRepo.findAll();
        for(Notification n : all) { n.setRead(true); }
        notificationRepo.saveAll(all);
        return ResponseEntity.ok(Map.of("message","All marked as read"));
    }
}