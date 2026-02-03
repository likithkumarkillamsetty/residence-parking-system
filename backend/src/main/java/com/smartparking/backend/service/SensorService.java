package com.smartparking.backend.service;

import com.smartparking.backend.model.Slot;
import com.smartparking.backend.repository.SlotRepository;
import org.springframework.stereotype.Service;

@Service
public class SensorService {

    private final SlotRepository slotRepository;

    // If sensor ON state lasts more than this, we treat as parked
    private static final long PARK_THRESHOLD_MS = 8000; // 8 seconds

    public SensorService(SlotRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    public String processSensorEvent(String slotId, String state) {

        Slot slot = slotRepository.findBySlotId(slotId);
        if (slot == null) {
            return "Slot not found";
        }

        long now = System.currentTimeMillis();

        // SENSOR ON — car is entering slot
        if (state.equalsIgnoreCase("ON")) {
            slot.setLastOnTimestamp(now);
            slotRepository.save(slot);
            return "Sensor ON recorded for slot " + slotId;
        }

        // SENSOR OFF — car left sensor range, calculate time spent
        if (state.equalsIgnoreCase("OFF")) {
            long duration = now - slot.getLastOnTimestamp();

            if (duration >= PARK_THRESHOLD_MS) {
                // Car stayed long enough — it's PARKED
                slot.setOccupied(true);
                slot.setTentative(true);   // OCR will assign real number later
                slot.setCurrentVehicle("UNKNOWN");
                slotRepository.save(slot);

                return "Car parked in slot " + slotId + " (tentative)";
            } else {
                // Car just passed by — ignore
                return "Passing vehicle ignored for slot " + slotId;
            }
        }

        return "Invalid sensor state";
    }
}
