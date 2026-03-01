package com.petwellness.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Model representing a Pet Vaccination record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "vaccinations")
public class Vaccination {

    @Id
    private String id;

    @Indexed
    private String petId;

    private String vaccineName;

    private LocalDate lastGivenDate;

    private LocalDate givenDate;

    private LocalDate nextDueDate;
    
    @Field("doctorName")
    private String doctorName;

    private int doseNumber;

    @Indexed
    @Builder.Default
    private VaccinationStatus status = VaccinationStatus.UPCOMING;

    @Builder.Default
    private boolean reminderSent = false;

    @Builder.Default
    private boolean dueDateReminderSent = false;

    @Builder.Default
    private int reminderCount = 0;

    private LocalDate lastReminderDate;

    private String attachmentPath;

    @CreatedDate
    private LocalDateTime createdAt;

    @Version
    private Long version;
}
