package com.logguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.logguard.repository.mongo")
public class LogguardApplication {
    public static void main(String[] args) {
        SpringApplication.run(LogguardApplication.class, args);
    }
}