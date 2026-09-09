package com.logguard.controller;

import com.logguard.model.Notification;
import com.logguard.repository.mongo.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public Map<String, Object> getAll() {
        List<Notification> all = notificationRepository.findAllByOrderByCreatedAtDesc();
        long unread = all.stream().filter(n -> !n.isRead()).count();
        return Map.of("notifications", all, "unreadCount", unread);
    }

    // THIS FIXES YOUR "Mark all read" CLICK BUG
    @PutMapping("/read-all")
    public ResponseEntity<?> readAll() {
        List<Notification> all = notificationRepository.findAll();
        all.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(all);
        return ResponseEntity.ok(Map.of("message", "All marked as read", "count", all.size()));
    }

    @DeleteMapping("/delete-all")
    public ResponseEntity<?> deleteAll() {
        long count = notificationRepository.count();
        notificationRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "All deleted", "deleted", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> readOne(@PathVariable String id) {
        return notificationRepository.findById(id).map(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
            return ResponseEntity.ok(Map.of("message", "Marked read"));
        }).orElse(ResponseEntity.notFound().build());
    }
}