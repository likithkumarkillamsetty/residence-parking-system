package com.smartparking.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "owners")
public class Owner {

    @Id
    private String id;

    private String name;
    private String phone;
    private String flatNumber;

    private List<String> vehicleNumbers; // store ALL vehicle numbers belonging to this owner
}
