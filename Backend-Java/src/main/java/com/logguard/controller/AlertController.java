package com.logguard.controller;

import com.logguard.model.Alert;
import com.logguard.repository.mongo.AlertMongoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AlertController {
    @Autowired private AlertMongoRepository alertRepo;

    @GetMapping
    public List<Alert> getAll() { return alertRepo.findAll(); }

    @GetMapping("/all")
    public List<Alert> all() { return alertRepo.findAll(); }

    @GetMapping("/active")
    public List<Alert> active() {
        return alertRepo.findByResolvedFalseOrderByTimestampDesc();
    }

    @RequestMapping(value = "/test", method = {RequestMethod.GET, RequestMethod.POST})
    public Alert test() {
        Alert a = new Alert();
        a.setLevel("CRITICAL");
        a.setServiceName("payment-service");
        a.setMessage("Day35 Test - " + LocalDateTime.now());
        a.setTimestamp(LocalDateTime.now());
        a.setResolved(false);
        return alertRepo.save(a);
    }

    @PutMapping("/{id}/resolve")
    public Alert resolve(@PathVariable String id) {
        Alert a = alertRepo.findById(id).orElseThrow(() -> new RuntimeException("Alert not found"));
        a.setResolved(true);
        return alertRepo.save(a);
    }
}