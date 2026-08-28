package com.logguard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String message;
    private String level;
    private String logId;
    private String userId;
    private boolean isRead = false;
    private boolean read = false;
    private Date createdAt = new Date();

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getLogId() { return logId; }
    public void setLogId(String logId) { this.logId = logId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public boolean getIsRead() { return isRead; }
    public void setIsRead(boolean isRead) { this.isRead = isRead; this.read = isRead; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; this.isRead = read; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}