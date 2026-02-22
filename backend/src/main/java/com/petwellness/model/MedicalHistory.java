package com.petwellness.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Model representing a Pet's Medical History.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medical_history")
public class MedicalHistory {

    @Id
    private String id;

    @Indexed
    private String petId;

    private LocalDate visitDate;

    private String doctorName;

    private String diagnosis;

    private String treatment;

    private String notes;

    private LocalDate followUpDate;

    private String attachmentPath;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
