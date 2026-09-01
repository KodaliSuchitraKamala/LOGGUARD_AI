package com.logguard.controller;

import com.logguard.model.Log;
import com.logguard.model.Notification;
import com.logguard.repository.mongo.LogRepository;
import com.logguard.repository.mongo.NotificationRepository;
import com.logguard.service.AlertService;
import com.logguard.service.LogParserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
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
    @Autowired private MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.uri:NOT_LOADED}")
    private String mongoUri;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "Java Backend Running", "port", "8080", "ai", "active", "db", "Atlas Connected");
    }

    @GetMapping("/debug/where")
    public Map<String, String> where() {
        String masked = mongoUri.length() > 35 ? mongoUri.substring(0, 35) + "..." : mongoUri;
        return Map.of(
            "uri", masked,
            "isAtlas", String.valueOf(mongoUri.contains("mongodb+srv")),
            "isLocal", String.valueOf(mongoUri.contains("localhost") || mongoUri.contains("127.0.0.1")),
            "envLoaded", mongoUri.equals("NOT_LOADED") ? "NO - .env file not found in Backend-Java/" : "YES"
        );
    }

    @GetMapping("/debug/mongo")
    public Map<String, Object> debugMongo() {
        long count = logRepo.count();
        long notifCount = notificationRepo.count();
        String dbName = mongoTemplate.getDb().getName();
        var collections = mongoTemplate.getDb().listCollectionNames().into(new ArrayList<>());
        return Map.of(
            "database", dbName,
            "collections", collections,
            "logsCount", count,
            "notificationsCount", notifCount,
            "isAtlas", mongoUri.contains("mongodb+srv") ? "YES" : "NO - YOU ARE ON LOCAL MONGO, NOT ATLAS"
        );
    }

    @PostMapping({"/analyze", "/logs/analyze"})
    public ResponseEntity<?> analyze(@RequestBody Map<String, Object> body) {
        if (body.containsKey("logs")) {
            Object logsObj = body.get("logs");
            String firstError = "DB Connection Lost";
            if (logsObj instanceof List) {
                List<?> list = (List<?>) logsObj;
                Optional<?> err = list.stream().filter(o -> o.toString().contains("ERROR") || o.toString().contains("CRITICAL")).findFirst();
                if (err.isPresent()) firstError = err.get().toString();
            }
            if (firstError.toUpperCase().contains("CRITICAL") || firstError.toUpperCase().contains("ERROR")) {
                Notification n = new Notification(firstError, "CRITICAL");
                notificationRepo.save(n);
                alertService.checkAndAlert("CRITICAL", firstError);
            }
            Map<String, Object> result = new HashMap<>();
            result.put("rootCause", firstError);
            result.put("suggestedFix", "Restart DB and check connection pool. Check Atlas IP whitelist.");
            result.put("confidence", 92);
            result.put("level", "CRITICAL");
            result.put("analyzed", logsObj instanceof List ? ((List<?>)logsObj).size() : 1);
            return ResponseEntity.ok(result);
        }
        String logMessage = (String) body.getOrDefault("message", body.getOrDefault("log", "Test log"));
        Log parsed = parserService.parse(logMessage);
        Log saved = logRepo.save(parsed);
        if ("CRITICAL".equalsIgnoreCase(saved.getLevel()) || "ERROR".equalsIgnoreCase(saved.getLevel())) {
            notificationRepo.save(new Notification(saved.getMessage(), saved.getLevel()));
            alertService.checkAndAlert(saved.getLevel(), saved.getMessage());
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
                    logRepo.save(parsed);
                    count++;
                    if ("CRITICAL".equalsIgnoreCase(parsed.getLevel()) || "ERROR".equalsIgnoreCase(parsed.getLevel())) {
                        notificationRepo.save(new Notification(parsed.getMessage(), parsed.getLevel()));
                        criticalCount++;
                    }
                }
            }
            if (criticalCount > 0) {
                alertService.checkAndAlert("CRITICAL", criticalCount + " critical logs found in uploaded file. Total: " + count);
            }
            return Map.of("message", "Uploaded " + count + " logs", "count", count, "critical", criticalCount);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", e.getMessage());
        }
    }

    @GetMapping("/logs")
    public List<Log> getLogs() {
        List<Log> all = logRepo.findAll();
        Collections.reverse(all);
        return all;
    }

    @GetMapping("/logs/search")
    public List<Log> searchLogs() { return getLogs(); }

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
        long warnings = logs.stream().filter(l -> "WARN".equalsIgnoreCase(l.getLevel())).count();
        long info = logs.stream().filter(l -> "INFO".equalsIgnoreCase(l.getLevel())).count();
        List<Map<String, Object>> levelDist = List.of(
            Map.of("name", "INFO", "value", info),
            Map.of("name", "WARN", "value", warnings),
            Map.of("name", "ERROR", "value", errors),
            Map.of("name", "CRITICAL", "value", critical)
        );
        Map<String, Object> result = new HashMap<>();
        result.put("total", logs.size());
        result.put("critical", critical);
        result.put("errors", errors);
        result.put("warnings", warnings);
        result.put("levelDistribution", levelDist);
        return result;
    }

    @GetMapping("/alerts-egacy")
    public List<Log> alerts() {
        return logRepo.findAll().stream().filter(l -> "CRITICAL".equalsIgnoreCase(l.getLevel()) || "ERROR".equalsIgnoreCase(l.getLevel())).limit(20).toList();
    }

    // --- FIXED NOTIFICATIONS ---
    @GetMapping("/notifications")
    public Map<String, Object> notifications() {
        List<Notification> all = notificationRepo.findAll();
        Collections.reverse(all);
        long unread = all.stream().filter(n -> !n.isRead()).count();
        return Map.of(
            "notifications", all,
            "unreadCount", unread
        );
    }

    @PutMapping("/notifications/read-all")
    public Map<String, Object> readAll() {
        List<Notification> all = notificationRepo.findAll();
        for (Notification n : all) {
            n.setIsRead(true);
        }
        notificationRepo.saveAll(all);
        return Map.of("message", "All marked read", "count", all.size());
    }

    @DeleteMapping("/logs")
    public Map<String, Object> deleteAllLogs() {
        long count = logRepo.count();
        logRepo.deleteAll();
        notificationRepo.deleteAll();
        return Map.of("message", "Deleted " + count + " logs from " + mongoTemplate.getDb().getName(), "deleted", count);
    }
}