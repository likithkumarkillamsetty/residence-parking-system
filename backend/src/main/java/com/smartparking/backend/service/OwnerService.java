package com.smartparking.backend.service;

import com.smartparking.backend.model.Owner;
import com.smartparking.backend.repository.OwnerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OwnerService {

    private final OwnerRepository ownerRepository;

    public OwnerService(OwnerRepository ownerRepository) {
        this.ownerRepository = ownerRepository;
    }

    public Owner saveOwner(Owner owner) {
        return ownerRepository.save(owner);
    }

    public List<Owner> getAllOwners() {
        return ownerRepository.findAll();
    }

    public Owner getOwnerByFlat(String flatNumber) {
        return ownerRepository.findByFlatNumber(flatNumber);
    }
}
