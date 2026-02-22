package com.petwellness.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for creating a Medical History record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalHistoryRequest {

    @NotBlank(message = "Pet ID is required")
    private String petId;

    @NotNull(message = "Visit date is required")
    private LocalDate visitDate;

    @NotBlank(message = "Doctor name is required")
    private String doctorName;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "Treatment is required")
    private String treatment;

    private String notes;

    private LocalDate followUpDate;
}
