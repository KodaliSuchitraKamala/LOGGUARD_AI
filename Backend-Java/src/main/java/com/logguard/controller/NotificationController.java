package com.logguard.controller;

import com.logguard.model.Notification;
import com.logguard.repository.mongo.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public Map<String, Object> getAll() {
        var all = notificationRepository.findAll();
        java.util.Collections.reverse(all);
        long unread = all.stream().filter(n -> !n.isRead()).count();
        return Map.of("notifications", all, "unreadCount", unread);
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> readAll() {
        var all = notificationRepository.findAll();
        all.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(all);
        return ResponseEntity.ok(Map.of("message", "All marked as read", "count", all.size()));
    }

    @DeleteMapping("/delete-all")
    public ResponseEntity<?> deleteAll() {
        long count = notificationRepository.count();
        notificationRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "All notifications deleted", "deleted", count));
    }

    // Extra for frontend compatibility
    @PutMapping("/read-all-legacy")
    @DeleteMapping("/delete-all-legacy")
    @RequestMapping(value = {"/read-all", "/delete-all"}, method = {RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.POST})
    public ResponseEntity<?> handleLegacy() {
        return ResponseEntity.ok(Map.of("status","ok"));
    }
}