package com.smartparking.backend.repository;

import com.smartparking.backend.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AlertRepository extends MongoRepository<Alert, String> {
    List<Alert> findByStatus(String status);
}
