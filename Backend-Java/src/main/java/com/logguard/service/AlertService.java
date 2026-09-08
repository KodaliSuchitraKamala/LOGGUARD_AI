package com.logguard.service;
import com.logguard.model.Alert;
import com.logguard.model.Log;
import com.logguard.repository.mongo.AlertMongoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AlertService {
    @Autowired private AlertMongoRepository alertRepository;
    private ConcurrentHashMap<String, LocalDateTime> dedupCache = new ConcurrentHashMap<>();

    public void checkAndAlert(String level, String message) {
        if (level == null || message == null) return;
        String upper = level.toUpperCase();
        if (upper.equals("CRITICAL") || upper.equals("ERROR")) {
            String hash = message.substring(0, Math.min(50, message.length()));
            LocalDateTime now = LocalDateTime.now();
            
            if(dedupCache.containsKey(hash) && dedupCache.get(hash).plusMinutes(15).isAfter(now)) return;
            if(alertRepository.existsByMessageAndServiceNameAndResolvedFalse(message, "LogGuard-AI")) return;

            dedupCache.put(hash, now);
            Alert alert = new Alert();
            alert.setLevel(upper);
            alert.setMessage(message);
            alert.setServiceName("LogGuard-AI");
            alert.setTimestamp(LocalDateTime.now());
            alert.setResolved(false);
            alertRepository.save(alert);
            System.out.println("ALERT SAVED TO ATLAS: " + message);
        }
    }
    public void checkAndAlert(Log log) {
        if(log != null) checkAndAlert(log.getLevel(), log.getMessage());
    }
}