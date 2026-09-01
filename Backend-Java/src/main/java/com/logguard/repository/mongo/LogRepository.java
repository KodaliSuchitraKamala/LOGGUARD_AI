package com.logguard.repository.mongo;

import com.logguard.model.Log;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogRepository extends MongoRepository<Log, String> {
    // Don't add countByUserId - your Log model doesn't have userId
    // We will count in controller differently if needed
}