package com.logguard.service;
import com.logguard.model.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class LogParserService {
    @Autowired private AiService aiService;

    public Log parse(String rawLog) {
        Log log = new Log();
        String level = "INFO";
        String upper = rawLog.toUpperCase();
        
        if (upper.contains("ERROR") || upper.contains("ERKOR")) {
            level = "ERROR";
        } else if (upper.contains("WARN")) {
            level = "WARN";
        } else if (upper.contains("CRITICAL")) {
            level = "CRITICAL";
        }
        
        log.setLevel(level);
        log.setMessage(rawLog);
        Map<String, String> ai = aiService.analyze(rawLog);
        log.setSeverity(ai.get("severity"));
        log.setRootCause(ai.get("rootCause"));
        log.setFix(ai.get("fix"));
        return log;
    }
}