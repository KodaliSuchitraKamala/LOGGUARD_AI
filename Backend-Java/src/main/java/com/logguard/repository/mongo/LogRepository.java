package com.logguard.repository.mongo;

import com.logguard.model.Log;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LogRepository extends MongoRepository<Log, String> {
    long countByLevel(String level);
    List<Log> findByLevel(String level);
    List<Log> findTop20ByOrderByTimestampDesc();
}