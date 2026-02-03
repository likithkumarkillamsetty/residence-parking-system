package com.smartparking.backend.repository;

import com.smartparking.backend.model.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VehicleRepository extends MongoRepository<Vehicle, String> {
    Vehicle findByNumberPlate(String numberPlate);
}
