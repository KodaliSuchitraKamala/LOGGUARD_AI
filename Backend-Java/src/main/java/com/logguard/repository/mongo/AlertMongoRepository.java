package com.logguard.repository.mongo;

import com.logguard.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AlertMongoRepository extends MongoRepository<Alert, String> {
    List<Alert> findByResolvedFalseOrderByTimestampDesc();
}