package com.petwellness.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for creating a new Vaccination record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationRequest {

    @NotBlank(message = "Pet ID is required")
    private String petId;

    @NotBlank(message = "Vaccine name is required")
    private String vaccineName;

    @NotNull(message = "Given date is required")
    private LocalDate givenDate;

    @NotNull(message = "Next due date is required")
    private LocalDate nextDueDate;

    @NotBlank(message = "Doctor name is required")
    private String doctorName;

    @AssertTrue(message = "Next due date must be after the given date")
    public boolean isNextDueDateAfterGivenDate() {
        if (givenDate == null || nextDueDate == null) return true;
        return nextDueDate.isAfter(givenDate);
    }

    @AssertTrue(message = "Next due date must be in the future")
    public boolean isNextDueDateInFuture() {
        if (nextDueDate == null) return true;
        return nextDueDate.isAfter(LocalDate.now());
    }
}
