package com.logguard.service;
import com.logguard.model.Log;
import com.logguard.repository.mongo.LogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class LogParserService {
    @Autowired private AiService aiService;
    @Autowired private LogRepository logRepository;

    public Log parse(String rawLog) {
        Log log = new Log();
        String upper = rawLog.toUpperCase();
        String level = "INFO";
        
        if (upper.contains("CRITICAL")) level = "CRITICAL";
        else if (upper.contains("ERROR") || upper.contains("ERKOR") || upper.contains("FATAL")) level = "ERROR";
        else if (upper.contains("WARN")) level = "WARN";
        
        log.setLevel(level);
        log.setMessage(rawLog);
        
        Map<String, String> ai = aiService.analyze(rawLog);
        log.setSeverity(ai.getOrDefault("severity", level));
        log.setRootCause(ai.getOrDefault("rootCause", "Unknown"));
        log.setFix(ai.getOrDefault("fix", "Check logs"));

        return log; // don't save here, save in controller to avoid double save
    }
}