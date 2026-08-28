package com.logguard.controller;

import com.logguard.model.Log;
import com.logguard.model.Notification;
import com.logguard.repository.LogRepository;
import com.logguard.repository.NotificationRepository;
import com.logguard.service.AlertService;
import com.logguard.service.LogParserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowedHeaders = "*", allowCredentials = "true")
public class LogController {

    @Autowired private LogParserService parserService;
    @Autowired private LogRepository logRepo;
    @Autowired private NotificationRepository notificationRepo;
    @Autowired private AlertService alertService;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "Java Backend Running", "port", "8080");
    }

    @PostMapping({"/analyze", "/logs/analyze"})
    public ResponseEntity<?> analyze(@RequestBody Map<String, Object> body) {
        if (body.containsKey("logs")) {
            Object logsObj = body.get("logs");
            String firstError = "DB Connection Lost";
            Map<String, Object> result = new HashMap<>();
            result.put("rootCause", firstError);
            result.put("suggestedFix", "Restart DB and check connection pool.");
            result.put("confidence", 92);
            result.put("level", "CRITICAL");
            return ResponseEntity.ok(result);
        }
        String logMessage = (String) body.getOrDefault("message", "Test log");
        Log parsed = parserService.parse(logMessage);
        Log saved = logRepo.save(parsed);
        if("CRITICAL".equalsIgnoreCase(saved.getLevel())) {
            createNotificationForLog(saved);
        }
        return ResponseEntity.ok(saved);
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public Map<String, Object> upload(HttpServletRequest request) {
        try {
            MultipartHttpServletRequest multiReq = (MultipartHttpServletRequest) request;
            Map<String, MultipartFile> fileMap = multiReq.getFileMap();
            if (fileMap.isEmpty()) return Map.of("error", "No file received");
            MultipartFile file = fileMap.values().iterator().next();
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            String[] lines = content.split("\\r?\\n");
            int count = 0;
            int criticalCount = 0;
            for (String line : lines) {
                if (!line.trim().isEmpty()) {
                    Log parsed = parserService.parse(line);
                    Log saved = logRepo.save(parsed);
                    count++;
                    if ("CRITICAL".equalsIgnoreCase(saved.getLevel()) || "ERROR".equalsIgnoreCase(saved.getLevel())) {
                        criticalCount++;
                        if("CRITICAL".equalsIgnoreCase(saved.getLevel())) {
                            createNotificationForLog(saved);
                        }
                    }
                }
            }
            if (criticalCount > 0) {
                alertService.checkAndAlert("CRITICAL", criticalCount + " critical logs found");
            }
            return Map.of("message", "Uploaded " + count + " logs", "count", count, "critical", criticalCount, "totalLogs", count);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", e.getMessage());
        }
    }

    private void createNotificationForLog(Log log) {
        try {
            Notification n = new Notification();
            n.setMessage("🚨 CRITICAL: " + log.getMessage());
            n.setLevel(log.getLevel());
            n.setLogId(log.getId());
            n.setRead(false);
            n.setCreatedAt(new Date());
            // save for all users - or set default userId
            n.setUserId("global"); 
            notificationRepo.save(n);
        } catch (Exception e) { e.printStackTrace(); }
    }

    @GetMapping("/logs")
    public List<Log> getLogs(@RequestParam(required=false) String keyword, @RequestParam(required=false) String level) {
        List<Log> all = logRepo.findAll();
        if (keyword != null && !keyword.isEmpty()) {
            return all.stream().filter(l -> l.getMessage() != null && l.getMessage().toLowerCase().contains(keyword.toLowerCase())).toList();
        }
        if (level != null && !level.equals("ALL") && !level.isEmpty()) {
            return all.stream().filter(l -> level.equalsIgnoreCase(l.getLevel())).toList();
        }
        return all;
    }

    @GetMapping("/logs/latest")
    public List<Log> getLatestLogs() {
        List<Log> all = logRepo.findAll();
        Collections.reverse(all);
        return all.stream().limit(20).toList();
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics() {
        List<Log> logs = logRepo.findAll();
        long critical = logs.stream().filter(l -> "CRITICAL".equalsIgnoreCase(l.getLevel())).count();
        long errors = logs.stream().filter(l -> "ERROR".equalsIgnoreCase(l.getLevel())).count();
        long warnings = logs.stream().filter(l -> "WARN".equalsIgnoreCase(l.getLevel()) || "WARNING".equalsIgnoreCase(l.getLevel())).count();
        long info = logs.stream().filter(l -> "INFO".equalsIgnoreCase(l.getLevel())).count();

        List<Map<String, Object>> levelDist = List.of(
            Map.of("name", "INFO", "value", info),
            Map.of("name", "WARN", "value", warnings),
            Map.of("name", "ERROR", "value", errors),
            Map.of("name", "CRITICAL", "value", critical)
        );

        Map<String, Object> result = new HashMap<>();
        result.put("total", logs.size());
        result.put("totalLogs", logs.size());
        result.put("critical", critical);
        result.put("errors", errors);
        result.put("warnings", warnings);
        result.put("avgResponseTime", 125);
        result.put("health", 100);
        result.put("levelDistribution", levelDist);
        result.put("errorTrend", List.of());
        result.put("responseTrend", List.of());
        return result;
    }

    @GetMapping("/alerts")
    public List<Log> alerts() {
        return logRepo.findAll().stream().filter(l -> "CRITICAL".equalsIgnoreCase(l.getLevel()) || "ERROR".equalsIgnoreCase(l.getLevel())).limit(20).toList();
    }

    // @GetMapping("/notifications")
    // public List<Notification> notifications() {
    //     List<Notification> all = notificationRepo.findAll();
    //     Collections.reverse(all);
    //     return all.stream().limit(50).toList();
    // }
}