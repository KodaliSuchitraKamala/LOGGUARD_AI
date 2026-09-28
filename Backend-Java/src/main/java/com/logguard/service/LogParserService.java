package com.logguard.service;
import com.logguard.model.Log;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.time.LocalDateTime;

@Service
public class LogParserService {
    private final AiService aiService;
    public LogParserService(AiService aiService){ this.aiService = aiService; }

    public Log parse(String rawLog) {
        if (rawLog == null) return null;
        String trimmed = rawLog.trim();
        // AUDIT FIX #1: Filter garbage
        if (trimmed.length() < 10 || trimmed.contains("00000 n") || trimmed.matches("^[0-9\\s+n]+$") || trimmed.equalsIgnoreCase("null")) {
            return null;
        }

        Log log = new Log();
        String upper = trimmed.toUpperCase();
        String level = "INFO";
        if (upper.contains("CRITICAL") || upper.contains("FATAL")) level = "CRITICAL";
        else if (upper.contains("ERROR") || upper.contains("ERKOR") || upper.contains("EXCEPTION") || upper.contains("FAIL")) level = "ERROR";
        else if (upper.contains("WARN")) level = "WARN";

        log.setLevel(level);
        log.setMessage(trimmed);
        log.setRaw(trimmed);
        log.setTimestamp(LocalDateTime.now());
        log.setSource("Upload");

        Map<String, String> ai = aiService.analyze(trimmed);
        log.setSeverity(ai.getOrDefault("severity", level));
        log.setRootCause(ai.getOrDefault("rootCause", "Unknown"));
        log.setFix(ai.getOrDefault("fix", "Check logs"));

        return log;
    }
}