package com.logguard.service;

import com.logguard.repository.mongo.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationCleanupService {
    @Autowired 
    private NotificationRepository repo;
    
    public void deleteAll() { 
        repo.deleteAll(); 
    }
    
    public void markAllRead() {
        var all = repo.findAll();
        for (var n : all) { n.setIsRead(true); }
        repo.saveAll(all);
    }
}