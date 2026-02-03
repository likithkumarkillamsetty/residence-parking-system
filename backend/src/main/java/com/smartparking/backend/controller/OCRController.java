package com.smartparking.backend.controller;

import com.smartparking.backend.service.OCRService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ocr")
@CrossOrigin
public class OCRController {

    private final OCRService ocrService;

    public OCRController(OCRService ocrService) {
        this.ocrService = ocrService;
    }

    @PostMapping("/extract")
    public ResponseEntity<?> extractPlate(@RequestParam("file") MultipartFile file) {
        String extracted = ocrService.extractNumberPlate(file);

        return ResponseEntity.ok().body(
                new java.util.HashMap<String, String>() {{
                    put("numberPlate", extracted);
                }}
        );
    }
}
