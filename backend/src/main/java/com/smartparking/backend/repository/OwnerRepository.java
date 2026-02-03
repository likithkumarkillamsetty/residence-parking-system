package com.smartparking.backend.repository;

import com.smartparking.backend.model.Owner;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OwnerRepository extends MongoRepository<Owner, String> {
    Owner findByFlatNumber(String flatNumber);

}
