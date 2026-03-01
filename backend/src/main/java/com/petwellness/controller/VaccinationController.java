package com.petwellness.controller;

import com.petwellness.dto.request.VaccinationRequest;
import com.petwellness.dto.response.VaccinationResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.VaccinationAudit;
import com.petwellness.model.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.VaccinationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;

/**
 * REST controller for vaccination management.
 */
@RestController
@RequestMapping("/api/vaccination")
@RequiredArgsConstructor
public class VaccinationController {

    private final VaccinationService vaccinationService;
    private final UserRepository userRepository;

    /**
     * Add a new vaccination record. Accepts multipart/form-data for file upload.
     */
    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VaccinationResponse> addVaccination(
            @RequestPart("petId") String petId,
            @RequestPart("vaccineName") String vaccineName,
            @RequestPart("doctorName") String doctorName,
            @RequestPart("givenDate") String givenDate,
            @RequestPart("nextDueDate") String nextDueDate,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) {

        VaccinationRequest request = VaccinationRequest.builder()
                .petId(petId)
                .vaccineName(vaccineName)
                .doctorName(doctorName)
                .givenDate(LocalDate.parse(givenDate))
                .nextDueDate(LocalDate.parse(nextDueDate))
                .build();

        String ownerId = getUserId(authentication);
        return ResponseEntity.ok(vaccinationService.addVaccination(request, file, ownerId));
    }

    /**
     * Get all vaccinations for a pet (sorted by next due date) with pagination.
     */
    @GetMapping("/{petId}")
    public ResponseEntity<Page<VaccinationResponse>> getVaccinations(
            @PathVariable String petId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            Authentication authentication) {
        String ownerId = getUserId(authentication);
        return ResponseEntity.ok(vaccinationService.getVaccinationsByPet(petId, ownerId, page, size));
    }


    /**
     * Update an existing vaccination record (marks as COMPLETED).
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<VaccinationResponse> updateVaccination(
            @PathVariable String id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate givenDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nextDueDate,
            @RequestParam(required = false) String doctorName,
            Authentication authentication) {
        String ownerId = getUserId(authentication);
        return ResponseEntity.ok(vaccinationService.updateVaccination(id, givenDate, nextDueDate, doctorName, ownerId));
    }

    /**
     * Add next dose for a vaccination.
     */
    @PostMapping("/{id}/next-dose")
    public ResponseEntity<VaccinationResponse> addNextDose(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nextDueDate,
            Authentication authentication) {
        String ownerId = getUserId(authentication);
        return ResponseEntity.ok(vaccinationService.addNextDose(id, nextDueDate, ownerId));
    }

    /**
     * Get vaccination audit history.
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<VaccinationAudit>> getHistory(
            @PathVariable String id,
            Authentication authentication) {
        String ownerId = getUserId(authentication);
        return ResponseEntity.ok(vaccinationService.getVaccinationHistory(id, ownerId));
    }

    /**
     * Helper to get user ID from JWT authentication.
     */
    private String getUserId(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
