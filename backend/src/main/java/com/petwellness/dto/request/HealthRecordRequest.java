package com.petwellness.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for creating or updating a Health Record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecordRequest {
    
    @NotNull(message = "Record date is required")
    private LocalDate date;
    
    @NotBlank(message = "Record type is required")
    private String type;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String veterinarian;
    
    private LocalDate followUpDate;
    
    private String notes;
    
    private List<String> attachmentUrls;
}
