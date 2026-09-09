package com.logguard.service;
import com.logguard.model.Alert;
import com.logguard.model.Log;
import com.logguard.model.Notification;
import com.logguard.repository.mongo.AlertMongoRepository;
import com.logguard.repository.mongo.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AlertService {
    @Autowired private AlertMongoRepository alertRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired(required = false) private EmailService emailService;
    
    private ConcurrentHashMap<String, LocalDateTime> dedupCache = new ConcurrentHashMap<>();

    public void checkAndAlert(String level, String message) {
        if (level == null || message == null) return;
        String upper = level.toUpperCase();
        if (upper.equals("CRITICAL") || upper.equals("ERROR") || upper.equals("FATAL")) {
            String hash = message.substring(0, Math.min(50, message.length()));
            LocalDateTime now = LocalDateTime.now();
            
            if(dedupCache.containsKey(hash) && dedupCache.get(hash).plusMinutes(15).isAfter(now)) return;
            if(alertRepository.existsByMessageAndServiceNameAndResolvedFalse(message, "LogGuard-AI")) return;

            dedupCache.put(hash, now);
            
            // 1. Save to Alert table (H2)
            Alert alert = new Alert();
            alert.setLevel(upper);
            alert.setMessage(message);
            alert.setServiceName("LogGuard-AI");
            alert.setTimestamp(LocalDateTime.now());
            alert.setResolved(false);
            alertRepository.save(alert);
            
            // 2. Save to Notification collection (Mongo) - THIS FIXES BELL
            Notification notif = new Notification(message, upper);
            notif.setCreatedAt(LocalDateTime.now());
            notif.setIsRead(false);
            notificationRepository.save(notif);
            
            // 3. Send Email - THIS FIXES MAIL
            if(emailService != null && upper.contains("CRITICAL")){
                try { emailService.sendCriticalAlert(message, upper); } 
                catch(Exception e){ System.out.println("Email fail: "+e.getMessage()); }
            }
            
            System.out.println("ALERT + NOTIFICATION SAVED: " + message);
        }
    }
    
    public void checkAndAlert(Log log) {
        if(log != null) checkAndAlert(log.getLevel(), log.getMessage());
    }
}