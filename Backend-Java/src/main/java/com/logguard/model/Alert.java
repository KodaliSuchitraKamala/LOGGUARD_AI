package com.logguard.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
@Document(collection = "alerts")
public class Alert {
    @Id private String id;
    private String level;
    private String serviceName;
    private String message;
    private LocalDateTime timestamp = LocalDateTime.now();
    private boolean resolved = false;
    public String getId(){return id;} public void setId(String id){this.id=id;}
    public String getLevel(){return level;} public void setLevel(String l){this.level=l;}
    public String getServiceName(){return serviceName;} public void setServiceName(String s){this.serviceName=s;}
    public String getMessage(){return message;} public void setMessage(String m){this.message=m;}
    public LocalDateTime getTimestamp(){return timestamp;} public void setTimestamp(LocalDateTime t){this.timestamp=t;}
    public boolean isResolved(){return resolved;} public void setResolved(boolean r){this.resolved=r;}
}