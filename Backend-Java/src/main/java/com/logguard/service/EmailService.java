package com.logguard.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${alert.receiver.email}")
    private String receiver;

    @Value("${spring.mail.username}")
    private String sender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendCriticalAlert(String logMessage, String level) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sender);
            message.setTo(receiver);
            message.setSubject("🚨 LogGuard AI ALERT: " + level + " Detected!");
            message.setText("Critical Log Detected:\n\nLevel: " + level + "\nMessage: " + logMessage + "\n\nTime: " + java.time.LocalDateTime.now() + "\n\n- LogGuard AI");
            
            mailSender.send(message);
            System.out.println("✅ Alert email sent to " + receiver);
        } catch (Exception e) {
            System.out.println("❌ Email failed: " + e.getMessage());
        }
    }
}