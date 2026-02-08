package com.petwellness.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for booking an appointment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookAppointmentRequest {

    @NotBlank(message = "Pet ID is required")
    private String petId;

    @NotBlank(message = "Slot ID is required")
    private String slotId;

    private String notes;
}
