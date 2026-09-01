package com.logguard.service;

import com.logguard.model.Alert;
import com.logguard.repository.mongo.AlertMongoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AlertService {
    @Autowired private AlertMongoRepository alertRepository;

    public void checkAndAlert(String level, String message) {
        if (level == null) return;
        if (level.equalsIgnoreCase("CRITICAL") || level.equalsIgnoreCase("ERROR")) {
            Alert alert = new Alert();
            alert.setLevel(level.toUpperCase());
            alert.setMessage(message);
            alert.setServiceName("LogGuard-AI");
            alert.setTimestamp(LocalDateTime.now());
            alert.setResolved(false);
            alertRepository.save(alert);
            System.out.println("ALERT SAVED TO ATLAS: " + message);
        }
    }
}