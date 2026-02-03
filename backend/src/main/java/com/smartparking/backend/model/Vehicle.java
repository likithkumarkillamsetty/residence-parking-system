package com.smartparking.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "vehicles")
public class Vehicle {

    @Id
    private String id;

    private String numberPlate;
    private String ownerId;     // Maps vehicle → owner
    private String model;
    private String color;
}
