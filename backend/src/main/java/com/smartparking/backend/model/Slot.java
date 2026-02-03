package com.smartparking.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "slots")
public class Slot {

    @Id
    private String id;

    private String slotId;            // e.g., SLOT-101
    private String ownerId;           // e.g., A101

    private boolean occupied;
    private String currentVehicle;

    private boolean tentative;        // sensor ON but OCR not confirmed
    private long lastOnTimestamp;     // for low confidence logic

    // 🔥 UI needs this field:
    private String state;             // EMPTY / TENTATIVE / OCCUPIED / VIOLATION

    public Slot() {
        this.state = "EMPTY";
        this.occupied = false;
        this.tentative = false;
        this.lastOnTimestamp = 0;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSlotId() { return slotId; }
    public void setSlotId(String slotId) { this.slotId = slotId; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public boolean isOccupied() { return occupied; }
    public void setOccupied(boolean occupied) { this.occupied = occupied; }

    public String getCurrentVehicle() { return currentVehicle; }
    public void setCurrentVehicle(String currentVehicle) { this.currentVehicle = currentVehicle; }

    public boolean isTentative() { return tentative; }
    public void setTentative(boolean tentative) { this.tentative = tentative; }

    public long getLastOnTimestamp() { return lastOnTimestamp; }
    public void setLastOnTimestamp(long lastOnTimestamp) { this.lastOnTimestamp = lastOnTimestamp; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}
