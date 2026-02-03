package com.smartparking.backend.service;

import com.smartparking.backend.model.Alert;
import com.smartparking.backend.model.Slot;
import com.smartparking.backend.repository.AlertRepository;
import com.smartparking.backend.repository.SlotRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final SlotRepository slotRepository;   // <-- ADD THIS

    public AlertService(AlertRepository alertRepository,
                        SlotRepository slotRepository) {   // <-- ADD HERE
        this.alertRepository = alertRepository;
        this.slotRepository = slotRepository;       // <-- AND HERE
    }

    public Alert createAlert(String slotId, String expectedOwnerId, String wrongVehicleNumber, String imagePath) {
        Alert a = new Alert();
        a.setSlotId(slotId);
        a.setExpectedOwnerId(expectedOwnerId);
        a.setWrongVehicleNumber(wrongVehicleNumber);
        a.setImagePath(imagePath);
        a.setStatus("PENDING");
        a.setCreatedAt(Instant.now());
        return alertRepository.save(a);
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public List<Alert> getPendingAlerts() { return alertRepository.findByStatus("PENDING"); }

    public Optional<Alert> findById(String id) { return alertRepository.findById(id); }

    public Alert acceptAlert(String id) {
        Alert alert = alertRepository.findById(id).orElse(null);
        if (alert == null) return null;

        // Mark alert as resolved
        alert.setStatus("RESOLVED");
        alertRepository.save(alert);

        // Update slot
        Slot slot = slotRepository.findBySlotId(alert.getSlotId());
        if (slot != null) {
            slot.setState("OCCUPIED");
            slot.setOccupied(true);
            slotRepository.save(slot);
        }

        return alert;
    }


    public Alert rejectAlert(String id) {
        Alert alert = alertRepository.findById(id).orElse(null);
        if (alert == null) return null;

        alert.setStatus("REJECTED");
        alertRepository.save(alert);

        // Optionally keep slot in violation or free
        Slot slot = slotRepository.findBySlotId(alert.getSlotId());
        if (slot != null) {
            slot.setState("VIOLATION"); // or slot.setState("EMPTY");
            slotRepository.save(slot);
        }

        return alert;
    }



    public Alert notifySecurity(String id) {
        Optional<Alert> o = alertRepository.findById(id);
        if (o.isPresent()) {
            Alert a = o.get();
            a.setStatus("NOTIFIED");
            // send notification to security (implementation depends on system)
            return alertRepository.save(a);
        }
        return null;
    }
}
