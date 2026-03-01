package com.petwellness.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity to store historical snapshots of Vaccination records.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "vaccinations_aud")
public class VaccinationAudit {

    @Id
    private String id;

    private String vaccinationId;
    private String petId;
    private String vaccineName;
    private String doctorName;
    private LocalDate lastGivenDate;
    private LocalDate givenDate;
    private LocalDate nextDueDate;
    private VaccinationStatus status;
    private int doseNumber;
    
    private Long revision;
    private String revisionType; // ADD, MOD, DEL
    private LocalDateTime revisionTimestamp;

    private boolean reminderSent;
    private int reminderCount;
    private String attachmentPath;
}
