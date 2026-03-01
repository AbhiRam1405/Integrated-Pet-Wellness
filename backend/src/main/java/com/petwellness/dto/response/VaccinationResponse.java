package com.petwellness.dto.response;

import com.petwellness.model.VaccinationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for returning Vaccination record data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationResponse {

    private String id;
    private String petId;
    private String vaccineName;
    private LocalDate lastGivenDate;
    private LocalDate givenDate;
    private LocalDate nextDueDate;
    private String doctorName;
    private int doseNumber;
    private VaccinationStatus status;
    private boolean reminderSent;
    private int reminderCount;
    private String attachmentPath;
    private LocalDateTime createdAt;
}
