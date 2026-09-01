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
        if (level == null || message == null) return;
        String upper = level.toUpperCase();
        if (upper.equals("CRITICAL") || upper.equals("ERROR")) {
            Alert alert = new Alert();
            alert.setLevel(upper);
            alert.setMessage(message);
            alert.setServiceName("LogGuard-AI");
            alert.setTimestamp(LocalDateTime.now());
            alert.setResolved(false);
            alertRepository.save(alert);
            System.out.println("ALERT SAVED TO ATLAS: " + message);
        }
    }

    public void checkAndAlert(com.logguard.model.Log log) {
        if(log != null) checkAndAlert(log.getLevel(), log.getMessage());
    }
}