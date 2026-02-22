package com.petwellness.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Medical History response details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalHistoryResponse {

    private String id;
    private String petId;
    private LocalDate visitDate;
    private String doctorName;
    private String diagnosis;
    private String treatment;
    private String notes;
    private LocalDate followUpDate;
    private String attachmentPath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
