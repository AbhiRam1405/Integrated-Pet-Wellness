package com.petwellness.dto.response;

import com.petwellness.model.AppointmentStatus;
import com.petwellness.model.ConsultationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Response DTO for appointment details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {

    private String id;
    private String userId;
    private String petId;
    private String slotId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private ConsultationType consultationType;
    private String veterinarianName;
    private AppointmentStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
