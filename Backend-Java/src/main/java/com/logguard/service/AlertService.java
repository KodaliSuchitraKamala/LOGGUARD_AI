package com.logguard.service;

import org.springframework.stereotype.Service;

@Service
public class AlertService {

    private final EmailService emailService;

    public AlertService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void checkAndAlert(String level, String message) {
        if (level.equalsIgnoreCase("CRITICAL") || level.equalsIgnoreCase("ERROR") || level.equalsIgnoreCase("FATAL")) {
            System.out.println("🚨 Triggering alert for: " + level);
            emailService.sendCriticalAlert(message, level);
        }
    }
}