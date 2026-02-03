package com.smartparking.backend.controller;

import com.smartparking.backend.model.EntryEvent;
import com.smartparking.backend.service.EntryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/entry")
@CrossOrigin
public class EntryController {

    private final EntryService entryService;

    public EntryController(EntryService entryService) {
        this.entryService = entryService;
    }

    @PostMapping
    public EntryEvent createEntry(@RequestParam String numberPlate) {

        EntryEvent event = new EntryEvent();
        event.setNumberPlate(numberPlate);

        return entryService.saveEntry(event);
    }
}
