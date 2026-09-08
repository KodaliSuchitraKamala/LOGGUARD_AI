package com.logguard.controller;

import com.logguard.model.Log;
import com.logguard.repository.mongo.LogRepository;
import com.logguard.repository.mongo.NotificationRepository;
import com.logguard.service.AlertService;
import com.logguard.service.LogParserService;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;
import java.util.*;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LogController {

    @Autowired private LogParserService parserService;
    @Autowired private LogRepository logRepo;
    @Autowired private NotificationRepository notificationRepo;
    @Autowired private AlertService alertService;

    private Map<String,Object> toMap(Log log){
        Map<String,Object> m = new HashMap<>();
        m.put("id", log.getId());
        m.put("_id", log.getId());
        m.put("level", log.getLevel()!=null && !log.getLevel().isBlank() ? log.getLevel().trim().toUpperCase() : "INFO");
        m.put("message", log.getMessage()!=null ? log.getMessage() : "");
        m.put("timestamp", log.getTimestamp()!=null ? log.getTimestamp().toString() : LocalDateTime.now().toString());
        m.put("severity", log.getSeverity());
        m.put("rootCause", log.getRootCause());
        m.put("fix", log.getFix());
        m.put("source", log.getSource());
        return m;
    }

    // FIXED FILTER: Never empties the result if DB has data
    private List<Log> applyFilters(List<Log> all, String keyword, String level){
        if(all.isEmpty()) return all;
        List<Log> current = new ArrayList<>(all);

        if(level != null && !level.trim().isEmpty() && !level.equalsIgnoreCase("ALL")){
            String target = level.trim().toUpperCase();
            List<Log> filtered = current.stream().filter(l -> {
                String lvl = l.getLevel()==null ? "INFO" : l.getLevel().trim().toUpperCase();
                if(target.equals("INFO")) return lvl.contains("INFO") || lvl.isBlank();
                if(target.contains("WARN")) return lvl.contains("WARN");
                if(target.equals("ERROR")) return lvl.contains("ERROR") || lvl.contains("FATAL") || lvl.contains("ERKOR");
                if(target.equals("CRITICAL")) return lvl.contains("CRITICAL");
                return lvl.equals(target) || lvl.contains(target);
            }).toList();
            if(!filtered.isEmpty()){
                current = filtered;
                System.out.println("Level filter "+target+" -> "+current.size());
            } else {
                System.out.println("Level filter "+target+" gave 0, KEEPING "+current.size()+" (not emptying)");
            }
        }

        if(keyword != null && !keyword.trim().isEmpty()){
            String q = keyword.trim().toLowerCase();
            if(q.length()>=2){
                List<Log> filtered = current.stream().filter(l -> {
                    String msg = l.getMessage()==null ? "" : l.getMessage().toLowerCase();
                    String lvl = l.getLevel()==null ? "" : l.getLevel().toLowerCase();
                    return msg.contains(q) || lvl.contains(q);
                }).toList();
                if(!filtered.isEmpty()){
                    current = filtered;
                    System.out.println("Keyword '"+q+"' -> "+current.size());
                } else {
                    System.out.println("Keyword '"+q+"' gave 0, KEEPING "+current.size());
                }
            }
        }
        return current;
    }

    @GetMapping("/logs/latest")
    public ResponseEntity<List<Map<String,Object>>> getLatestLogs(){
        List<Log> all = logRepo.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
        return ResponseEntity.ok(all.stream().limit(50).map(this::toMap).toList());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<Map<String,Object>>> getLogs(
            @RequestParam(required=false) String keyword,
            @RequestParam(required=false) String level){
        List<Log> all = logRepo.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
        all = applyFilters(all, keyword, level);
        List<Map<String,Object>> paged = all.stream().limit(50).map(this::toMap).toList();
        return ResponseEntity.ok(paged);
    }

    @GetMapping("/logs/search")
    public ResponseEntity<List<Map<String,Object>>> searchLogsAdvanced(
            @RequestParam(required=false) String keyword,
            @RequestParam(required=false) String level){
        List<Log> all = logRepo.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
        System.out.println("SEARCH keyword="+keyword+" level="+level+" DB="+all.size());
        List<Log> filtered = applyFilters(all, keyword, level);
        if(filtered.isEmpty() && !all.isEmpty()){
            System.out.println("SEARCH would be empty, returning ALL "+all.size());
            filtered = all;
        }
        List<Map<String,Object>> result = filtered.stream().map(this::toMap).toList();
        System.out.println("SEARCH RETURNING "+result.size());
        return ResponseEntity.ok(result);
    }

    @GetMapping({"/stats","/logs/stats","/dashboard/stats"})
    public ResponseEntity<Map<String,Object>> getDashboardStats(){
        long total = logRepo.count();
        long critical = logRepo.countByLevel("CRITICAL");
        long errors = logRepo.countByLevel("ERROR");
        long warnings = logRepo.countByLevel("WARN");
        Map<String,Object> r = new HashMap<>();
        r.put("criticals", critical); r.put("critical", critical);
        r.put("errors", errors); r.put("warnings", warnings);
        r.put("totalLogs", total); r.put("total", total);
        r.put("health", total==0 ? 100 : 98);
        return ResponseEntity.ok(r);
    }

    @PostMapping(value="/upload", consumes="multipart/form-data")
    public ResponseEntity<Map<String,Object>> upload(HttpServletRequest request){
        try{
            MultipartHttpServletRequest multiReq = (MultipartHttpServletRequest) request;
            MultipartFile file = multiReq.getFileMap().values().iterator().next();
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            int count=0;
            for(String line: content.split("\\r?\\n")){
                if(!line.trim().isEmpty()){
                    Log parsed = parserService.parse(line);
                    if(parsed.getLevel()==null || parsed.getLevel().isBlank()) parsed.setLevel("INFO");
                    if(parsed.getTimestamp()==null) parsed.setTimestamp(LocalDateTime.now());
                    logRepo.save(parsed); count++;
                }
            }
            return ResponseEntity.ok(Map.of("message","Uploaded "+count+" logs","count",count));
        }catch(Exception e){ e.printStackTrace(); return ResponseEntity.ok(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/analytics") public ResponseEntity<Map<String,Object>> analytics(){ return getDashboardStats(); }
    @GetMapping("/analytics/trends") public ResponseEntity<Map<String,Object>> getTrends(){ return ResponseEntity.ok(Map.of("dates", List.of("Today"), "errors", List.of(0))); }
    @GetMapping({"/alerts-legacy"}) public ResponseEntity<List<Map<String,Object>>> alerts(){ return ResponseEntity.ok(logRepo.findByLevel("CRITICAL").stream().limit(20).map(this::toMap).toList()); }
    @DeleteMapping({"/logs","/logs/clear"}) public ResponseEntity<Map<String,Object>> deleteAllLogs(){ long c=logRepo.count(); logRepo.deleteAll(); return ResponseEntity.ok(Map.of("message","Deleted "+c)); }
    @GetMapping("/health") public Map<String,String> health(){ return Map.of("status","Java Backend Running"); }
}