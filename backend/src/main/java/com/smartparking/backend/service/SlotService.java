package com.smartparking.backend.service;

import com.smartparking.backend.model.Alert;
import com.smartparking.backend.model.Owner;
import com.smartparking.backend.model.Slot;
import com.smartparking.backend.model.Vehicle;
import com.smartparking.backend.repository.AlertRepository;
import com.smartparking.backend.repository.OwnerRepository;
import com.smartparking.backend.repository.SlotRepository;
import com.smartparking.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SlotService {

    private final SlotRepository slotRepository;
    private final VehicleRepository vehicleRepository;
    private final OwnerRepository ownerRepository;
    private final AlertRepository alertRepository;
    private final AlertService alertService;

    public SlotService(
            SlotRepository slotRepository,
            VehicleRepository vehicleRepository,
            OwnerRepository ownerRepository,
            AlertRepository alertRepository,
            AlertService alertService
    ) {
        this.slotRepository = slotRepository;
        this.vehicleRepository = vehicleRepository;
        this.ownerRepository = ownerRepository;
        this.alertRepository = alertRepository;
        this.alertService = alertService;
    }

    // ---------------- BASIC CRUD ------------------

    public Slot saveSlot(Slot slot) {
        if (slot.getState() == null) slot.setState("EMPTY");
        return slotRepository.save(slot);
    }

    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    public Slot getSlotById(String slotId) {
        return slotRepository.findBySlotId(slotId);
    }

    public Slot updateSlot(Slot slot) {
        return slotRepository.save(slot);
    }

    // ---------------- DETECTION (MANUAL OR SENSOR) ------------------

    public String processSlotDetection(String slotId, String numberPlate) {

        Slot slot = slotRepository.findBySlotId(slotId);
        if (slot == null) return "Slot not found";

        Vehicle vehicle = vehicleRepository.findByNumberPlate(numberPlate);

        if (vehicle == null) {
            // Unknown vehicle
            Alert created = alertService.createAlert(slotId, slot.getOwnerId(), numberPlate, null);
            slot.setState("VIOLATION");
            slot.setOccupied(true);
            slot.setCurrentVehicle(numberPlate);
            slotRepository.save(slot);
            return "Unknown Vehicle — Alert Generated (id=" + created.getId() + ")";
        }

        Owner expectedOwner = ownerRepository.findByFlatNumber(slot.getOwnerId());
        Owner actualOwner = ownerRepository.findByFlatNumber(vehicle.getOwnerId());

        boolean isCorrect =
                expectedOwner != null &&
                        actualOwner != null &&
                        expectedOwner.getFlatNumber().equals(actualOwner.getFlatNumber());

        if (isCorrect) {
            slot.setState("OCCUPIED");
            slot.setCurrentVehicle(numberPlate);
            slot.setOccupied(true);
            slotRepository.save(slot);
            return "Correct Parking";
        }

        // Wrong vehicle → alert
        Alert created = alertService.createAlert(slotId, slot.getOwnerId(), numberPlate, null);

        slot.setState("VIOLATION");
        slot.setOccupied(true);
        slot.setCurrentVehicle(numberPlate);
        slotRepository.save(slot);

        return "Wrong Parking — Alert Generated (id=" + created.getId() + ")";
    }

    // ---------------- OCR FINALIZE ------------------

    public String finalizeParking(String slotId, String numberPlate, String imagePath) {

        Slot slot = slotRepository.findBySlotId(slotId);
        if (slot == null) return "Slot not found";

        slot.setCurrentVehicle(numberPlate);
        slot.setTentative(false);
        slot.setOccupied(true);

        Vehicle vehicle = vehicleRepository.findByNumberPlate(numberPlate);

        if (vehicle == null) {
            Alert created = alertService.createAlert(slotId, slot.getOwnerId(), numberPlate, imagePath);
            slot.setState("VIOLATION");
            slotRepository.save(slot);
            return "Unknown vehicle — Alert Generated (id=" + created.getId() + ")";
        }

        Owner expectedOwner = ownerRepository.findByFlatNumber(slot.getOwnerId());
        Owner actualOwner = ownerRepository.findByFlatNumber(vehicle.getOwnerId());

        boolean isCorrect =
                expectedOwner != null &&
                        actualOwner != null &&
                        expectedOwner.getFlatNumber().equals(actualOwner.getFlatNumber());

        if (isCorrect) {
            slot.setState("OCCUPIED");
            slotRepository.save(slot);
            return "Correct Parking Confirmed";
        }

        Alert created = alertService.createAlert(slotId, slot.getOwnerId(), numberPlate, imagePath);
        slot.setState("VIOLATION");
        slotRepository.save(slot);

        return "Wrong Parking — Alert Generated (id=" + created.getId() + ")";
    }
}
