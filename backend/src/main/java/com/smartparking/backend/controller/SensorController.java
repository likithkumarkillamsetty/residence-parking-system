package com.smartparking.backend.controller;

import com.smartparking.backend.service.SensorService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/slots")
public class SensorController {

    private final SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    // Example:
    // POST http://localhost:8080/api/slots/sensor?slotId=A101&state=ON
    @PostMapping("/sensor")
    public String sensorEvent(
            @RequestParam String slotId,
            @RequestParam String state
    ) {
        return sensorService.processSensorEvent(slotId, state);
    }
}
