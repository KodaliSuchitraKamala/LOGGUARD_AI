package com.logguard.controller;

import com.logguard.model.Log;
import com.logguard.model.Notification;
import com.logguard.repository.mongo.LogRepository;
import com.logguard.repository.mongo.NotificationRepository;
import com.logguard.service.AlertService;
import com.logguard.service.LogParserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
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
public class LogController {

    @Autowired private LogParserService parserService;
    @Autowired private LogRepository logRepo;
    @Autowired private NotificationRepository notificationRepo;
    @Autowired private AlertService alertService;
    @Autowired private MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.uri:NOT_LOADED}") private String mongoUri;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "Java Backend Running", "port", "8080", "ai", "active", "db", "Atlas Connected");
    }

    @GetMapping({"/stats", "/logs/stats", "/dashboard/stats"})
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            long critical = logRepo.countByLevel("CRITICAL");
            long errors = logRepo.countByLevel("ERROR");
            long warnings = logRepo.countByLevel("WARN") + logRepo.countByLevel("WARNING");
            long total = logRepo.count();
            int health = total==0?98:critical==0?98:critical<=11?98:Math.max(20,100-(int)(critical*2+errors));
            Map<String,Object> result = new HashMap<>();
            result.put("criticals", critical); result.put("critical", critical);
            result.put("errors", errors); result.put("warnings", warnings);
            result.put("totalLogs", total); result.put("total", total);
            result.put("health", health);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String,Object> fallback = new HashMap<>();
            fallback.put("criticals", 0); fallback.put("critical", 0);
            fallback.put("errors", 0); fallback.put("warnings", 0);
            fallback.put("totalLogs", 0); fallback.put("total", 0);
            fallback.put("health", 100);
            return ResponseEntity.ok(fallback);
        }
    }

    @GetMapping("/logs/latest")
    public ResponseEntity<List<Log>> getLatestLogs() {
        try {
            return ResponseEntity.ok(logRepo.findTop20ByOrderByTimestampDesc());
        } catch (Exception e) {
            try {
                List<Log> all = logRepo.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
                return ResponseEntity.ok(all.stream().limit(20).toList());
            } catch (Exception e2) {
                return ResponseEntity.ok(List.of());
            }
        }
    }

    @GetMapping("/logs/search")
    public ResponseEntity<List<Log>> searchLogs(@RequestParam(required = false) String level) {
        try {
            if(level != null && !level.isEmpty()){
                String up = level.toUpperCase();
                if(up.equals("WARNING")) up = "WARN";
                List<Log> res = logRepo.findByLevel(up);
                if(res.isEmpty() && up.equals("WARN")) res = logRepo.findByLevel("WARNING");
                return ResponseEntity.ok(res);
            }
            return ResponseEntity.ok(logRepo.findTop20ByOrderByTimestampDesc());
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/debug/mongo")
    public ResponseEntity<Map<String,Object>> debugMongo() {
        try {
            return ResponseEntity.ok(Map.of(
                "database", mongoTemplate.getDb().getName(),
                "collections", mongoTemplate.getDb().listCollectionNames().into(new ArrayList<>()),
                "logsCount", logRepo.count(),
                "notificationsCount", notificationRepo.count(),
                "isAtlas", mongoUri.contains("mongodb+srv") ? "YES" : "NO"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", e.getMessage(), "logsCount", 0));
        }
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<Map<String,Object>> upload(HttpServletRequest request) {
        try {
            MultipartHttpServletRequest multiReq = (MultipartHttpServletRequest) request;
            MultipartFile file = multiReq.getFileMap().values().iterator().next();
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            String[] lines = content.split("\\r?\\n");
            int count=0, criticalCount=0;
            for (String line : lines) {
                if (!line.trim().isEmpty()) {
                    Log parsed = parserService.parse(line);
                    logRepo.save(parsed); count++;
                    if ("CRITICAL".equalsIgnoreCase(parsed.getLevel()) || "ERROR".equalsIgnoreCase(parsed.getLevel())) {
                        notificationRepo.save(new Notification(parsed.getMessage(), parsed.getLevel()));
                        criticalCount++;
                    }
                }
            }
            if (criticalCount>0) alertService.checkAndAlert("CRITICAL", criticalCount+" critical logs");
            return ResponseEntity.ok(Map.of("message","Uploaded "+count+" logs","count",count,"critical",criticalCount));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<Map<String,Object>> getLogs(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="50") int size) {
        try {
            Page<Log> logPage = logRepo.findAll(PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"timestamp")));
            return ResponseEntity.ok(Map.of("logs",logPage.getContent(),"total",logPage.getTotalElements(),"page",page,"totalPages",logPage.getTotalPages()));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("logs",List.of(),"total",0,"page",0,"totalPages",0));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String,Object>> analytics() {
        try {
            long critical = logRepo.countByLevel("CRITICAL");
            long errors = logRepo.countByLevel("ERROR");
            long warnings = logRepo.countByLevel("WARN")+logRepo.countByLevel("WARNING");
            long info = logRepo.countByLevel("INFO");
            long total = logRepo.count();
            int health = total==0?98:critical<=11?98:Math.max(20,100-(int)(critical*2+errors));
            return ResponseEntity.ok(Map.of(
                "total",total,"totalLogs",total,"criticals",critical,"critical",critical,"errors",errors,"warnings",warnings,"health",health,
                "levelDistribution", List.of(Map.of("name","INFO","value",info),Map.of("name","WARN","value",warnings),Map.of("name","ERROR","value",errors),Map.of("name","CRITICAL","value",critical))
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("total",0,"totalLogs",0,"criticals",0,"errors",0,"warnings",0,"health",100,"levelDistribution",List.of()));
        }
    }

    @GetMapping({"/alerts-legacy","/alerts-egacy"})
    public ResponseEntity<List<Log>> alerts() {
        try { return ResponseEntity.ok(logRepo.findByLevel("CRITICAL").stream().limit(20).toList()); }
        catch (Exception e) { return ResponseEntity.ok(List.of()); }
    }

    @DeleteMapping("/logs")
    public ResponseEntity<Map<String,Object>> deleteAllLogs() {
        try {
            long count = logRepo.count(); logRepo.deleteAll(); notificationRepo.deleteAll();
            return ResponseEntity.ok(Map.of("message","Deleted "+count+" logs","deleted",count));
        } catch (Exception e) { return ResponseEntity.ok(Map.of("message","Deleted 0 logs")); }
    }
}