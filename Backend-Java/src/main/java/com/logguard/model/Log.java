package com.logguard.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "logs")
public class Log {
    @Id 
    private String id;
    
    private String level;
    private String message;
    private String severity;
    private String rootCause;
    private String fix;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp = LocalDateTime.now();
    
    private String confidence = "92%";
    private String source = "system";
    private String fileName = "";

    public Log() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getSeverity() { return severity; }
    public void setSeverity(String s) { this.severity = s; }
    
    public String getRootCause() { return rootCause; }
    public void setRootCause(String r) { this.rootCause = r; }
    
    public String getFix() { return fix; }
    public void setFix(String f) { this.fix = f; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime t) { this.timestamp = t; }
    
    public String getConfidence() { return confidence; }
    public void setConfidence(String c) { this.confidence = c; }
    
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
}