package com.smartparking.backend.service;

import com.smartparking.backend.model.EntryEvent;
import com.smartparking.backend.repository.EntryEventRepository;
import org.springframework.stereotype.Service;

@Service
public class EntryService {

    private final EntryEventRepository entryEventRepository;

    public EntryService(EntryEventRepository entryEventRepository) {
        this.entryEventRepository = entryEventRepository;
    }

    public EntryEvent saveEntry(EntryEvent entryEvent) {
        return entryEventRepository.save(entryEvent);
    }
}
