package com.smartparking.backend.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/uploads")
@CrossOrigin
public class FileServeController {

    @GetMapping("/{filename}")
    public ResponseEntity<FileSystemResource> getFile(@PathVariable String filename) {
        File file = new File("uploads/" + filename);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new FileSystemResource(file));
    }
}
