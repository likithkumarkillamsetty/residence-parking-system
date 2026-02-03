package com.smartparking.backend.controller;

import com.smartparking.backend.model.Slot;
import com.smartparking.backend.repository.SlotRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ExitController {

    private final SlotRepository slotRepository;

    public ExitController(SlotRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    // Example:
    // POST http://localhost:8080/api/exit?numberPlate=TS09AB1234
    @PostMapping("/exit")
    public String handleExit(@RequestParam String numberPlate) {

        Slot slot = slotRepository.findByCurrentVehicle(numberPlate);

        if (slot == null) {
            return "No slot found for vehicle " + numberPlate;
        }

        slot.setOccupied(false);
        slot.setTentative(false);
        slot.setCurrentVehicle("");
        slotRepository.save(slot);

        return "Vehicle " + numberPlate + " exit processed — slot " + slot.getSlotId() + " is now empty.";
    }
}
