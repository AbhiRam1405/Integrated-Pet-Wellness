package com.petwellness.dto.response;

import com.petwellness.model.ConsultationType;
import com.petwellness.model.SlotStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Response DTO for appointment slot details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentSlotResponse {

    private String id;
    private LocalDate date;
    private LocalTime time;
    private ConsultationType consultationType;
    private String veterinarianName;
    private SlotStatus status;
    private Integer duration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
