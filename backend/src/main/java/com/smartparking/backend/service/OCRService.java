package com.smartparking.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class OCRService {

    public String extractNumberPlate(MultipartFile file) {

        try {
            // DEMO MODE -----------------------------------
            // If the image filename contains a number, return it
            // Example: "car_TS09AB1111.jpg" → TS09AB1111

            String name = file.getOriginalFilename();
            if (name != null) {
                String upper = name.toUpperCase();

                // SIMPLE pattern for demo plates
                String regex = "(TS\\d{2}[A-Z]{2}\\d{4})";

                java.util.regex.Pattern p = java.util.regex.Pattern.compile(regex);
                java.util.regex.Matcher m = p.matcher(upper);

                if (m.find()) {
                    return m.group(1);
                }
            }

            // DEFAULT DEMO VALUE
            return "TS09AB1111";

        } catch (Exception e) {
            return "OCR_ERROR";
        }
    }
}
