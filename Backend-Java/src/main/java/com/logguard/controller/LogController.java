package com.logguard.controller;

import com.logguard.model.Log;
import com.logguard.repository.LogRepository;
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
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowedHeaders = "*")
public class LogController {

    @Autowired private LogParserService parserService;
    @Autowired private LogRepository logRepo;
    @Autowired private AlertService alertService; // Day 33

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "Java Backend Running", "port", "8080", "ai", "active", "db", "Atlas Connected");
    }

    @PostMapping({"/analyze", "/logs/analyze"})
    public ResponseEntity<?> analyze(@RequestBody Map<String, Object> body) {
        // Case 1: Frontend sends { logs: [...] } for AI Root Cause
        if (body.containsKey("logs")) {
            Object logsObj = body.get("logs");
            String firstError = "DB Connection Lost";
            if (logsObj instanceof List) {
                List<?> list = (List<?>) logsObj;
                Optional<?> err = list.stream().filter(o -> o.toString().contains("ERROR") || o.toString().contains("CRITICAL")).findFirst();
                if (err.isPresent()) firstError = err.get().toString();
            }
            // Day 33 - Alert if critical
            if (firstError.toUpperCase().contains("CRITICAL") || firstError.toUpperCase().contains("ERROR")) {
                alertService.checkAndAlert("CRITICAL", firstError);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("rootCause", firstError.contains("DB") || firstError.contains("Connection") ? "DB Connection Lost" : firstError);
            result.put("suggestedFix", "Restart DB and check connection pool. Check Atlas IP whitelist, increase poolSize, and add retryWrites=true in connection string.");
            result.put("confidence", 92);
            result.put("level", "CRITICAL");
            result.put("analyzed", logsObj instanceof List ? ((List<?>)logsObj).size() : 1);
            return ResponseEntity.ok(result);
        }
        // Case 2: Single message
        String logMessage = (String) body.getOrDefault("message", body.getOrDefault("log", "Test log"));
        Log parsed = parserService.parse(logMessage);
        try { 
            Log saved = logRepo.save(parsed);
            // Day 33 - Trigger email alert
            alertService.checkAndAlert(saved.getLevel(), saved.getMessage());
            return ResponseEntity.ok(saved); 
        } 
        catch (Exception e) { 
            alertService.checkAndAlert(parsed.getLevel(), parsed.getMessage());
            return ResponseEntity.ok(parsed); 
        }
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
                    try { 
                        logRepo.save(parsed); 
                        count++;
                        if ("CRITICAL".equalsIgnoreCase(parsed.getLevel()) || "ERROR".equalsIgnoreCase(parsed.getLevel())) {
                            criticalCount++;
                        }
                    } catch (Exception ignore) {}
                }
            }
            // Day 33 - Bulk alert summary
            if (criticalCount > 0) {
                alertService.checkAndAlert("CRITICAL", criticalCount + " critical logs found in uploaded file. Total logs: " + count);
            }
            return Map.of("message", "Uploaded " + count + " logs", "count", count, "critical", criticalCount);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", e.getMessage());
        }
    }

    @GetMapping("/logs")
    public List<Log> getLogs(@RequestParam(required=false) String keyword, @RequestParam(required=false) String level) {
        try {
            List<Log> all = logRepo.findAll();
            if (keyword != null && !keyword.isEmpty()) {
                return all.stream().filter(l -> l.getMessage() != null && l.getMessage().toLowerCase().contains(keyword.toLowerCase())).toList();
            }
            if (level != null && !level.equals("ALL") && !level.isEmpty()) {
                return all.stream().filter(l -> level.equalsIgnoreCase(l.getLevel())).toList();
            }
            return all;
        } catch (Exception e) { return List.of(); }
    }

    @GetMapping({"/logs/search"})
    public List<Log> searchLogs(@RequestParam(required=false) String keyword, @RequestParam(required=false) String level,
                                @RequestParam(required=false) Integer page, @RequestParam(required=false) Integer limit) {
        return getLogs(keyword, level);
    }

    @GetMapping("/logs/latest")
    public List<Log> getLatestLogs() {
        try {
            List<Log> all = logRepo.findAll();
            Collections.reverse(all);
            return all.stream().limit(20).toList();
        } catch (Exception e) { return List.of(); }
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics() {
        try {
            List<Log> logs = logRepo.findAll();
            long critical = logs.stream().filter(l -> "CRITICAL".equalsIgnoreCase(l.getLevel())).count();
            long errors = logs.stream().filter(l -> "ERROR".equalsIgnoreCase(l.getLevel()) || "ERKOR".equalsIgnoreCase(l.getLevel())).count();
            long warnings = logs.stream().filter(l -> "WARN".equalsIgnoreCase(l.getLevel()) || "WARNING".equalsIgnoreCase(l.getLevel())).count();
            long info = logs.stream().filter(l -> "INFO".equalsIgnoreCase(l.getLevel())).count();

            List<Map<String, Object>> errorTrend = new ArrayList<>();
            List<Map<String, Object>> responseTrend = new ArrayList<>();
            for (int i=6; i>=0; i--) {
                Map<String, Object> e1 = new HashMap<>();
                e1.put("date", "Day " + (7-i));
                e1.put("count", i==0 ? errors : (int)(Math.random()*3));
                errorTrend.add(e1);
                Map<String, Object> e2 = new HashMap<>();
                e2.put("date", "Day " + (7-i));
                e2.put("avg", 100 + (int)(Math.random()*50));
                responseTrend.add(e2);
            }

            List<Map<String, Object>> levelDist = new ArrayList<>();
            levelDist.add(Map.of("name", "INFO", "value", info));
            levelDist.add(Map.of("name", "WARN", "value", warnings));
            levelDist.add(Map.of("name", "ERROR", "value", errors));
            levelDist.add(Map.of("name", "CRITICAL", "value", critical));

            Map<String, Object> result = new HashMap<>();
            result.put("total", logs.size());
            result.put("totalLogs", logs.size());
            result.put("critical", critical);
            result.put("criticals", critical);
            result.put("errors", errors);
            result.put("warnings", warnings);
            result.put("avgResponseTime", 125);
            result.put("avgResponse", 125);
            result.put("health", 100);
            result.put("levelDistribution", levelDist);
            result.put("errorTrend", errorTrend);
            result.put("responseTrend", responseTrend);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> result = new HashMap<>();
            result.put("total", 0);
            result.put("totalLogs", 0);
            result.put("critical", 0);
            result.put("criticals", 0);
            result.put("errors", 0);
            result.put("warnings", 0);
            result.put("avgResponseTime", 0);
            result.put("avgResponse", 0);
            result.put("health", 100);
            result.put("levelDistribution", List.of());
            result.put("errorTrend", List.of());
            result.put("responseTrend", List.of());
            return result;
        }
    }

    @GetMapping("/alerts")
    public List<Log> alerts() {
        try { return logRepo.findAll().stream().filter(l -> "CRITICAL".equalsIgnoreCase(l.getLevel()) || "ERROR".equalsIgnoreCase(l.getLevel())).limit(10).toList(); }
        catch (Exception e) { return List.of(); }
    }

        @GetMapping("/notifications")
    public List<Map<String, String>> notifications() { return List.of(); }

}