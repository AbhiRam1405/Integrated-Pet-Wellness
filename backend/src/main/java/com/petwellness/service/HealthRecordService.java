package com.petwellness.service;

import com.petwellness.dto.request.HealthRecordRequest;
import com.petwellness.dto.response.HealthRecordResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.HealthRecord;
import com.petwellness.model.Pet;
import com.petwellness.repository.HealthRecordRepository;
import com.petwellness.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for health record management.
 */
@Service
@RequiredArgsConstructor
public class HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;
    private final PetRepository petRepository;

    /**
     * Add a new health record for a pet.
     */
    public HealthRecordResponse addRecord(String petId, HealthRecordRequest request, String ownerId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + petId));

        // Check ownership
        if (!pet.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized: You do not own this pet");
        }

        HealthRecord record = HealthRecord.builder()
                .petId(petId)
                .date(request.getDate())
                .type(request.getType())
                .description(request.getDescription())
                .veterinarian(request.getVeterinarian())
                .followUpDate(request.getFollowUpDate())
                .notes(request.getNotes())
                .attachmentUrls(request.getAttachmentUrls())
                .build();

        HealthRecord savedRecord = healthRecordRepository.save(record);
        return mapToResponse(savedRecord);
    }

    /**
     * Get all health records for a pet.
     */
    public List<HealthRecordResponse> getRecordsByPet(String petId, String ownerId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + petId));

        // Check ownership
        if (!pet.getOwnerId().equals(ownerId)) {
            // Admin could also view this in a real app, adding just owner check for now
            throw new RuntimeException("Unauthorized: You do not own this pet");
        }

        return healthRecordRepository.findByPetIdOrderByDateDesc(petId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific health record.
     */
    public HealthRecordResponse getRecordById(String id) {
        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health record not found with id: " + id));
        return mapToResponse(record);
    }

    /**
     * Delete a health record.
     */
    public void deleteRecord(String id, String ownerId) {
        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health record not found with id: " + id));

        Pet pet = petRepository.findById(record.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet associated with record not found"));

        // Check ownership
        if (!pet.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized: You do not own this pet");
        }

        healthRecordRepository.delete(record);
    }

    /**
     * Map HealthRecord entity to HealthRecordResponse DTO.
     */
    private HealthRecordResponse mapToResponse(HealthRecord record) {
        return HealthRecordResponse.builder()
                .id(record.getId())
                .petId(record.getPetId())
                .date(record.getDate())
                .type(record.getType())
                .description(record.getDescription())
                .veterinarian(record.getVeterinarian())
                .followUpDate(record.getFollowUpDate())
                .notes(record.getNotes())
                .attachmentUrls(record.getAttachmentUrls())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
