package com.petwellness.service;

import com.petwellness.dto.request.MedicalHistoryRequest;
import com.petwellness.dto.response.MedicalHistoryResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.exception.UnauthorizedAccessException;
import com.petwellness.model.MedicalHistory;
import com.petwellness.model.Pet;
import com.petwellness.repository.MedicalHistoryRepository;
import com.petwellness.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class MedicalHistoryService {

    private final MedicalHistoryRepository medicalHistoryRepository;
    private final PetRepository petRepository;
    private final FileUploadService fileUploadService;

    /**
     * Add a new medical history record.
     */
    public MedicalHistoryResponse addHistory(MedicalHistoryRequest request, MultipartFile attachment, String ownerId) {
        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + request.getPetId()));

        // Ownership Verification
        if (!pet.getOwnerId().equals(ownerId)) {
            throw new UnauthorizedAccessException("You do not have permission to add history for this pet");
        }

        String attachmentPath = null;
        if (attachment != null && !attachment.isEmpty()) {
            attachmentPath = fileUploadService.uploadFile(attachment);
        }

        MedicalHistory history = MedicalHistory.builder()
                .petId(request.getPetId())
                .visitDate(request.getVisitDate())
                .doctorName(request.getDoctorName())
                .diagnosis(request.getDiagnosis())
                .treatment(request.getTreatment())
                .notes(request.getNotes())
                .followUpDate(request.getFollowUpDate())
                .attachmentPath(attachmentPath)
                .build();

        MedicalHistory savedHistory = medicalHistoryRepository.save(history);
        return mapToResponse(savedHistory);
    }

    /**
     * Get all medical history for a pet with pagination.
     */
    public Page<MedicalHistoryResponse> getHistoryByPet(String petId, String ownerId, int page, int size) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + petId));

        // Ownership Verification
        if (!pet.getOwnerId().equals(ownerId)) {
            throw new UnauthorizedAccessException("You do not have permission to view history for this pet");
        }

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        return medicalHistoryRepository.findByPetId(petId, pageable)
                .map(this::mapToResponse);
    }


    private MedicalHistoryResponse mapToResponse(MedicalHistory history) {
        return MedicalHistoryResponse.builder()
                .id(history.getId())
                .petId(history.getPetId())
                .visitDate(history.getVisitDate())
                .doctorName(history.getDoctorName())
                .diagnosis(history.getDiagnosis())
                .treatment(history.getTreatment())
                .notes(history.getNotes())
                .followUpDate(history.getFollowUpDate())
                .attachmentPath(history.getAttachmentPath())
                .createdAt(history.getCreatedAt())
                .updatedAt(history.getUpdatedAt())
                .build();
    }
}
