package com.smartparking.backend.repository;

import com.smartparking.backend.model.Slot;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SlotRepository extends MongoRepository<Slot, String> {

    Slot findBySlotId(String slotId);
    Slot findByCurrentVehicle(String currentVehicle);
}
