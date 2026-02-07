package com.petwellness.controller;

import com.petwellness.dto.request.HealthRecordRequest;
import com.petwellness.dto.response.HealthRecordResponse;
import com.petwellness.dto.response.MessageResponse;
import com.petwellness.service.HealthRecordService;
import com.petwellness.repository.UserRepository;
import com.petwellness.model.User;
import com.petwellness.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for pet health records.
 */
@RestController
@RequestMapping("/api/pets/{petId}/health-records")
@RequiredArgsConstructor
public class HealthRecordController {

    private final HealthRecordService healthRecordService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<HealthRecordResponse> addRecord(
            @PathVariable String petId,
            @Valid @RequestBody HealthRecordRequest request,
            Authentication authentication) {
        String ownerId = getUserId(authentication);
        return ResponseEntity.ok(healthRecordService.addRecord(petId, request, ownerId));
    }

    @GetMapping
    public ResponseEntity<List<HealthRecordResponse>> getRecords(
            @PathVariable String petId,
            Authentication authentication) {
        String ownerId = getUserId(authentication);
        return ResponseEntity.ok(healthRecordService.getRecordsByPet(petId, ownerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteRecord(
            @PathVariable String id,
            Authentication authentication) {
        String ownerId = getUserId(authentication);
        healthRecordService.deleteRecord(id, ownerId);
        return ResponseEntity.ok(new MessageResponse("Health record deleted successfully", true));
    }

    /**
     * Helper to get user ID from authentication.
     */
    private String getUserId(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
