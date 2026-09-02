package com.logguard.controller;

import com.logguard.service.AiService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class AiController {

    private final AiService aiService;
    public AiController(AiService aiService) { this.aiService = aiService; }

    @RequestMapping(value = "/logs/analyze", method = {RequestMethod.GET, RequestMethod.POST})
    public Map<String,Object> analyze(@RequestParam(required = false) String message, @RequestBody(required = false) Object bodyObj) {
        String finalMessage = message;

        if (finalMessage == null && bodyObj != null) {
            if (bodyObj instanceof Map) {
                Map<?,?> map = (Map<?,?>) bodyObj;
                Object logs = map.get("logs");
                Object msg = map.get("message");
                if (msg == null) msg = map.get("log");
                
                if (logs != null) {
                    // Frontend sends {logs: [...]} -> take first critical
                    finalMessage = logs.toString();
                    if (logs instanceof List && !((List)logs).isEmpty()) {
                        Object first = ((List)logs).get(0);
                        finalMessage = first.toString();
                        // if first is object with message field
                        if (first instanceof Map) {
                            Object m = ((Map)first).get("message");
                            if (m != null) finalMessage = m.toString();
                        }
                    }
                } else if (msg != null) {
                    finalMessage = msg.toString();
                } else {
                    finalMessage = map.toString();
                }
            } else {
                finalMessage = bodyObj.toString();
            }
        }

        if (finalMessage == null || finalMessage.isEmpty() || finalMessage.equals("[]")) {
            finalMessage = "DB Connection Lost";
        }

        Map<String,String> aiResult = aiService.analyze(finalMessage);
        Map<String,Object> res = new HashMap<>();
        res.put("rootCause", aiResult.get("rootCause"));
        res.put("confidence", aiResult.get("confidence"));
        res.put("analysis", aiResult.get("fix"));
        res.put("suggestion", aiResult.get("fix"));
        res.put("fix", aiResult.get("fix"));
        res.put("severity", aiResult.get("severity"));
        return res;
    }
    
    @RequestMapping(value = {"/ai/analyze", "/ai/root-cause", "/root-cause"}, method = {RequestMethod.GET, RequestMethod.POST})
    public Map<String,Object> rootCause(@RequestParam(required = false) String message, @RequestBody(required = false) Object body) {
        return analyze(message, body);
    }
}