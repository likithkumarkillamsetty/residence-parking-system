package com.smartparking.backend.controller;

import com.smartparking.backend.model.Alert;
import com.smartparking.backend.service.AlertService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public List<Alert> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    @GetMapping("/pending")
    public List<Alert> getPendingAlerts() {
        return alertService.getPendingAlerts();
    }

    @PostMapping("/accept")
    public String accept(@RequestParam String id) {
        Alert a = alertService.acceptAlert(id);
        return a != null ? "ACCEPTED" : "NOT_FOUND";
    }

    @PostMapping("/reject")
    public String reject(@RequestParam String id) {
        Alert a = alertService.rejectAlert(id);
        if (a != null) {
            // optionally notify security automatically on reject
            alertService.notifySecurity(id);
            return "REJECTED_AND_SECURITY_NOTIFIED";
        }
        return "NOT_FOUND";
    }

    @PostMapping("/notify-security")
    public String notifySecurity(@RequestParam String id) {
        Alert a = alertService.notifySecurity(id);
        return a != null ? "NOTIFIED" : "NOT_FOUND";
    }
}
