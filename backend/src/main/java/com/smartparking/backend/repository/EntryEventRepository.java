package com.smartparking.backend.repository;

import com.smartparking.backend.model.EntryEvent;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EntryEventRepository extends MongoRepository<EntryEvent, String> {
}
