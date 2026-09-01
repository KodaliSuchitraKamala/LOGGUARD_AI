package com.logguard.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AiService {
    
    private final AlertService alertService;

    public AiService(AlertService alertService) {
        this.alertService = alertService;
    }

    public Map<String, String> analyze(String logMessage) {
        String low = logMessage.toLowerCase();
        String severity = "LOW";
        String rootCause = "Routine operation";
        String fix = "No action needed";

        if (low.contains("erkor")) {
            low = low.replace("erkor", "error");
        }

        if (low.contains("critical") || low.contains("crash") || low.contains("down")) {
            severity = "CRITICAL";
            rootCause = "Service crash / DB disconnection";
            fix = "Restart service and check MongoDB connection";
        } else if (low.contains("error") || low.contains("fail")) {
            severity = "CRITICAL";
            rootCause = "DB Connection Lost";
            fix = "Restart DB and check connection pool";
        } else if (low.contains("warn")) {
            severity = "MEDIUM";
            rootCause = "High resource usage";
            fix = "Scale up or optime query";
        }

        if (severity.equals("CRITICAL")) {
            System.out.println("🚨 AiService detected CRITICAL: " + logMessage);
            alertService.checkAndAlert(severity, logMessage);
        }

        Map<String, String> result = new HashMap<>();
        result.put("severity", severity);
        result.put("rootCause", rootCause);
        result.put("fix", fix);
        result.put("confidence", "92%");
        return result;
    }
}