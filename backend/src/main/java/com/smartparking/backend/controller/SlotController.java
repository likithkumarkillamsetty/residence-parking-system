package com.smartparking.backend.controller;

import com.smartparking.backend.model.Slot;
import com.smartparking.backend.service.SlotService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    @PostMapping
    public Slot createSlot(@RequestBody Slot slot) {
        return slotService.saveSlot(slot);
    }

    @PostMapping("/detect")
    public String detectVehicle(
            @RequestParam String slotId,
            @RequestParam String numberPlate
    ) {
        return slotService.processSlotDetection(slotId, numberPlate);
    }

    @PostMapping("/finalize")
    public String finalizeParking(
            @RequestParam String slotId,
            @RequestParam String numberPlate,
            @RequestParam(required = false) String imagePath
    ) {
        return slotService.finalizeParking(slotId, numberPlate, imagePath);
    }

    @GetMapping
    public List<Slot> getAllSlots() {
        return slotService.getAllSlots();
    }

    @GetMapping("/{slotId}")
    public Slot getSlot(@PathVariable String slotId) {
        return slotService.getSlotById(slotId);
    }

    @PostMapping("/update")
    public Slot updateSlot(@RequestBody Slot slot) {
        return slotService.updateSlot(slot);
    }
}
