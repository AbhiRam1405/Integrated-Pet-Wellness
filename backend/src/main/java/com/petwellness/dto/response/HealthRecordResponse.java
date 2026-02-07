package com.petwellness.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Health Record details response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecordResponse {
    
    private String id;
    
    private String petId;
    
    private LocalDate date;
    
    private String type;
    
    private String description;
    
    private String veterinarian;
    
    private LocalDate followUpDate;
    
    private String notes;
    
    private List<String> attachmentUrls;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
