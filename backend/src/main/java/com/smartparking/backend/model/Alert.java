package com.smartparking.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "alerts")
public class Alert {

    @Id
    private String id;

    private String slotId;
    private String expectedOwnerId;   // flat / owner id who should be in this slot
    private String wrongVehicleNumber;
    private String imagePath;         // relative path or URL to uploaded image
    private String status;            // PENDING, ACCEPTED, REJECTED, NOTIFIED
    private Instant createdAt;

    public Alert() {}

    // getters & setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }

    public String getExpectedOwnerId() { return expectedOwnerId; }
    public void setExpectedOwnerId(String expectedOwnerId) { this.expectedOwnerId = expectedOwnerId; }

    public String getWrongVehicleNumber() { return wrongVehicleNumber; }
    public void setWrongVehicleNumber(String wrongVehicleNumber) { this.wrongVehicleNumber = wrongVehicleNumber; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
