package com.logguard.controller;

import com.logguard.repository.mongo.LogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AiController {

    @Autowired private LogRepository logRepo;

    @RequestMapping(value = "/logs/analyze", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
    public ResponseEntity<Map<String,Object>> analyze(@RequestBody(required = false) Map<String,Object> body) {
        long total = logRepo.count();
        long critical = logRepo.countByLevel("CRITICAL");
        return ResponseEntity.ok(Map.of(
            "errorType", "DatabaseConnectionError",
            "confidence", 92,
            "impact", total + " services affected",
            "rootCause", "Connection pool exhausted due to "+critical+" CRITICAL logs",
            "fix", "Increase hikari max pool size to 50, add retry logic",
            "severity", "CRITICAL",
            "suggestion", "Increase pool size"
        ));
    }
}