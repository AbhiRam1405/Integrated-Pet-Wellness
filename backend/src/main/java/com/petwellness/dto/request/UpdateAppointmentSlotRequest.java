package com.petwellness.dto.request;

import com.petwellness.model.ConsultationType;
import com.petwellness.model.SlotStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request DTO for updating an existing appointment slot.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAppointmentSlotRequest {

    @FutureOrPresent(message = "Date must be in the present or future")
    private LocalDate date;

    private LocalTime time;

    private ConsultationType consultationType;

    private String veterinarianName;

    private SlotStatus status;

    @Positive(message = "Duration must be positive")
    private Integer duration;
}
