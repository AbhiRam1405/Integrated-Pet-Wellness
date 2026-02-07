package com.petwellness.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Model representing a Pet's Health Record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "health_records")
public class HealthRecord {
    
    @Id
    private String id;
    
    @Indexed
    private String petId;
    
    private LocalDate date;
    
    private String type; // e.g., Vaccination, Checkup, Surgery, Medication
    
    private String description;
    
    private String veterinarian;
    
    private LocalDate followUpDate;
    
    private String notes;
    
    private List<String> attachmentUrls;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
