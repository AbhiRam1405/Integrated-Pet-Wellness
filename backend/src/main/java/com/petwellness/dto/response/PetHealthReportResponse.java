package com.petwellness.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for the complete Pet Health Report.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetHealthReportResponse {

    private PetInfo petInfo;
    private List<MedicalHistoryInfo> medicalHistory;
    private List<VaccinationInfo> vaccinations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PetInfo {
        private String petName;
        private String breed;
        private String age; // formatted age
        private String gender;
        private String ownerName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicalHistoryInfo {
        private LocalDate visitDate;
        private String doctorName;
        private String diagnosis;
        private String treatment;
        private LocalDate followUpDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VaccinationInfo {
        private String vaccineName;
        private String doctorName;
        private Integer doseNumber;
        private LocalDate givenDate;
        private LocalDate nextDueDate;
        private String status;
    }
}
