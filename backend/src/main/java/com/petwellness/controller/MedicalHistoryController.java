package com.petwellness.controller;

import com.petwellness.dto.request.MedicalHistoryRequest;
import com.petwellness.dto.response.MedicalHistoryResponse;
import com.petwellness.dto.response.MessageResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.MedicalHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/medical-history")
@RequiredArgsConstructor
public class MedicalHistoryController {

    private final MedicalHistoryService medicalHistoryService;
    private final UserRepository userRepository;

    @PostMapping("/add")
    public ResponseEntity<MessageResponse> addHistory(
            Authentication authentication,
            @RequestParam("petId") String petId,
            @RequestParam("visitDate") String visitDate,
            @RequestParam("doctorName") String doctorName,
            @RequestParam("diagnosis") String diagnosis,
            @RequestParam("treatment") String treatment,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "followUpDate", required = false) String followUpDate,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment) {
        
        String ownerId = getUserId(authentication);
        
        MedicalHistoryRequest request = MedicalHistoryRequest.builder()
                .petId(petId)
                .visitDate(LocalDate.parse(visitDate))
                .doctorName(doctorName)
                .diagnosis(diagnosis)
                .treatment(treatment)
                .notes(notes)
                .followUpDate(followUpDate != null && !followUpDate.isEmpty() ? LocalDate.parse(followUpDate) : null)
                .build();

        medicalHistoryService.addHistory(request, attachment, ownerId);
        return ResponseEntity.ok(new MessageResponse("Medical history added successfully", true));
    }

    @GetMapping("/{petId}")
    public ResponseEntity<Page<MedicalHistoryResponse>> getHistory(
            @PathVariable String petId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            Authentication authentication) {
        String ownerId = getUserId(authentication);
        return ResponseEntity.ok(medicalHistoryService.getHistoryByPet(petId, ownerId, page, size));
    }


    private String getUserId(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
