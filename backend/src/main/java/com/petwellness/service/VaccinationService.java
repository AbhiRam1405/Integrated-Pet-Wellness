package com.petwellness.service;

import com.petwellness.dto.request.VaccinationRequest;
import com.petwellness.dto.response.VaccinationResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.exception.UnauthorizedAccessException;
import com.petwellness.model.Pet;
import com.petwellness.model.Vaccination;
import com.petwellness.model.VaccinationAudit;
import com.petwellness.model.VaccinationStatus;
import com.petwellness.repository.PetRepository;
import com.petwellness.repository.VaccinationAuditRepository;
import com.petwellness.repository.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;


/**
 * Service for vaccination management.
 */
@Service
@RequiredArgsConstructor
public class VaccinationService {

    private final VaccinationRepository vaccinationRepository;
    private final PetRepository petRepository;
    private final VaccinationAuditRepository auditRepository;
    private final VaccinationFileUploadService vaccinationFileUploadService;

    /**
     * Add a new vaccination record for a pet.
     */
    public VaccinationResponse addVaccination(VaccinationRequest request, MultipartFile file, String ownerId) {
        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + request.getPetId()));

        if (!pet.getOwnerId().equals(ownerId)) {
            throw new UnauthorizedAccessException("You do not have permission to add vaccinations for this pet");
        }

        // Fetch latest vaccination for same petId + vaccineName
        vaccinationRepository.findTopByPetIdAndVaccineNameOrderByDoseNumberDesc(request.getPetId(), request.getVaccineName())
                .ifPresent(prev -> {
                    if (calculateStatus(prev) != VaccinationStatus.COMPLETED) {
                        throw new IllegalArgumentException("You must complete the previous dose before adding a new one.");
                    }
                });

        if (request.getNextDueDate() != null && request.getGivenDate() != null && 
            !request.getNextDueDate().isAfter(request.getGivenDate())) {
            throw new IllegalArgumentException("Next due date must be after the given date.");
        }

        String attachmentPath = vaccinationFileUploadService.uploadFile(file);

        Vaccination vaccination = Vaccination.builder()
                .petId(request.getPetId())
                .vaccineName(request.getVaccineName())
                .givenDate(request.getGivenDate())
                .nextDueDate(request.getNextDueDate())
                .doctorName(request.getDoctorName() != null ? request.getDoctorName().trim() : "")
                .doseNumber(1) // Initial dose
                .status(VaccinationStatus.UPCOMING) // Initial status in DB must be UPCOMING
                .reminderSent(false)
                .reminderCount(0)
                .attachmentPath(attachmentPath)
                .build();

        Vaccination saved = vaccinationRepository.save(vaccination);
        return mapToResponse(saved);
    }

    /**
     * Get all vaccinations for a pet, sorted by next due date with pagination.
     */
    public Page<VaccinationResponse> getVaccinationsByPet(String petId, String ownerId, int page, int size) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + petId));

        if (!pet.getOwnerId().equals(ownerId)) {
            throw new UnauthorizedAccessException("You do not have permission to view vaccinations for this pet");
        }

        Sort sort = Sort.by(Sort.Direction.DESC, "givenDate", "doseNumber");
        Pageable pageable = PageRequest.of(page, size, sort);

        return vaccinationRepository.findByPetId(petId, pageable)
                .map(this::mapToResponse);
    }


    /**
     * Update a vaccination record (marks as completed or updates dates).
     */
    public VaccinationResponse updateVaccination(String id, LocalDate newGivenDate, LocalDate nextDueDate, String doctorName, String ownerId) {
        Vaccination vaccination = vaccinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccination record not found with id: " + id));

        Pet pet = petRepository.findById(vaccination.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found for this vaccination record"));

        if (!pet.getOwnerId().equals(ownerId)) {
            throw new UnauthorizedAccessException("You do not have permission to update this vaccination record");
        }

        if (vaccination.getStatus() == VaccinationStatus.COMPLETED) {
            throw new IllegalArgumentException("Completed vaccination records cannot be edited.");
        }

        // Logic for marking as done (updating givenDate)
        if (newGivenDate != null) {
            if (LocalDate.now().isBefore(newGivenDate)) {
                throw new IllegalArgumentException("Cannot mark vaccination as done for a future date.");
            }
            if (LocalDate.now().isBefore(vaccination.getGivenDate())) {
                throw new IllegalArgumentException("Cannot mark vaccination as done before the scheduled given date.");
            }
            vaccination.setLastGivenDate(vaccination.getGivenDate());
            vaccination.setGivenDate(newGivenDate);
            vaccination.setStatus(VaccinationStatus.COMPLETED);
        } else if (nextDueDate != null) {
            // Logic for updating overdue dates
            if (!nextDueDate.isAfter(vaccination.getGivenDate())) {
                throw new IllegalArgumentException("Next due date must be after the given date.");
            }
            vaccination.setNextDueDate(nextDueDate);
            vaccination.setStatus(VaccinationStatus.UPCOMING); // Ensure stored status is UPCOMING, never OVERDUE
        }

        if (doctorName != null && !doctorName.trim().isEmpty()) {
            vaccination.setDoctorName(doctorName.trim());
        }

        vaccination.setReminderSent(false);
        vaccination.setReminderCount(0);

        Vaccination updated = vaccinationRepository.save(vaccination);
        return mapToResponse(updated);
    }

    /**
     * Create the next dose for a specific vaccination.
     */
    public VaccinationResponse addNextDose(String id, LocalDate nextDueDate, String ownerId) {
        Vaccination prevDose = vaccinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Previous vaccination record not found"));

        Pet pet = petRepository.findById(prevDose.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        if (!pet.getOwnerId().equals(ownerId)) {
            throw new UnauthorizedAccessException("You do not have permission to add next dose for this pet");
        }

        if (calculateStatus(prevDose) != VaccinationStatus.COMPLETED) {
            throw new IllegalArgumentException("Can only add next dose after completing the current one.");
        }

        if (!nextDueDate.isAfter(prevDose.getNextDueDate())) {
            throw new IllegalArgumentException("New next due date must be after the current planned date (" + prevDose.getNextDueDate() + ")");
        }

        Vaccination nextDose = Vaccination.builder()
                .petId(prevDose.getPetId())
                .vaccineName(prevDose.getVaccineName())
                .lastGivenDate(prevDose.getGivenDate())
                .givenDate(prevDose.getNextDueDate())
                .nextDueDate(nextDueDate)
                .doctorName(prevDose.getDoctorName())
                .doseNumber(prevDose.getDoseNumber() + 1)
                .status(VaccinationStatus.UPCOMING)
                .reminderSent(false)
                .reminderCount(0)
                .build();

        Vaccination saved = vaccinationRepository.save(nextDose);
        return mapToResponse(saved);
    }

    /**
     * Get vaccination history (audit trail).
     */
    public List<VaccinationAudit> getVaccinationHistory(String id, String ownerId) {
        Vaccination vaccination = vaccinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccination record not found"));

        Pet pet = petRepository.findById(vaccination.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        if (!pet.getOwnerId().equals(ownerId)) {
            throw new UnauthorizedAccessException("You do not have permission to view history for this record");
        }

        return auditRepository.findByVaccinationIdOrderByRevisionDesc(id);
    }

    /**
     * Map Vaccination entity to VaccinationResponse DTO.
     */
    private VaccinationResponse mapToResponse(Vaccination vaccination) {
        return VaccinationResponse.builder()
                .id(vaccination.getId())
                .petId(vaccination.getPetId())
                .vaccineName(vaccination.getVaccineName())
                .lastGivenDate(vaccination.getLastGivenDate())
                .givenDate(vaccination.getGivenDate())
                .nextDueDate(vaccination.getNextDueDate())
                .doctorName(vaccination.getDoctorName() != null ? vaccination.getDoctorName() : "")
                .doseNumber(vaccination.getDoseNumber())
                .status(calculateStatus(vaccination))
                .reminderSent(vaccination.isReminderSent())
                .reminderCount(vaccination.getReminderCount())
                .attachmentPath(vaccination.getAttachmentPath())
                .createdAt(vaccination.getCreatedAt())
                .build();
    }

    /**
     * Automatically calculate status dynamically based on rules.
     * Logic: If COMPLETED -> COMPLETED, Else if today > nextDueDate -> OVERDUE, Else -> UPCOMING.
     */
    private VaccinationStatus calculateStatus(Vaccination v) {
        if (v.getStatus() != null && v.getStatus() == VaccinationStatus.COMPLETED) {
            return VaccinationStatus.COMPLETED;
        }
        
        LocalDate today = LocalDate.now();
        
        // Logic for scheduled givenDate: if today > givenDate and not COMPLETED -> OVERDUE
        if (v.getGivenDate() != null && today.isAfter(v.getGivenDate())) {
            return VaccinationStatus.OVERDUE;
        }

        // Keep existing logic for nextDueDate as well (preventative)
        if (v.getNextDueDate() != null && today.isAfter(v.getNextDueDate())) {
            return VaccinationStatus.OVERDUE;
        }
        
        return VaccinationStatus.UPCOMING;
    }
}
