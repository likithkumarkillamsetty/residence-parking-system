package com.smartparking.backend.controller;

import com.smartparking.backend.model.Owner;
import com.smartparking.backend.service.OwnerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owners")
@CrossOrigin
public class OwnerController {

    private final OwnerService ownerService;

    public OwnerController(OwnerService ownerService) {
        this.ownerService = ownerService;
    }

    @PostMapping
    public Owner addOwner(@RequestBody Owner owner) {
        return ownerService.saveOwner(owner);
    }

    @GetMapping
    public List<Owner> getAll() {
        return ownerService.getAllOwners();
    }

    @GetMapping("/{flatNumber}")
    public Owner getOwnerByFlat(@PathVariable String flatNumber) {
        return ownerService.getOwnerByFlat(flatNumber);
    }
}
