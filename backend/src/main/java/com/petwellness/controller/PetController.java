package com.petwellness.controller;

import com.petwellness.dto.request.PetRequest;
import com.petwellness.dto.response.PetResponse;
import com.petwellness.dto.response.MessageResponse;
import com.petwellness.service.PetService;
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
 * REST controller for pet management.
 */
@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;
    private final UserRepository userRepository;
    private final com.petwellness.service.ReportService reportService;

    @PostMapping
    public ResponseEntity<PetResponse> registerPet(
            Authentication authentication,
            @Valid @RequestBody PetRequest request) {
        String ownerId = getUserId(authentication);
        return ResponseEntity.ok(petService.registerPet(request, ownerId));
    }

    @GetMapping
    public ResponseEntity<List<PetResponse>> getMyPets(Authentication authentication) {
        String ownerId = getUserId(authentication);
        return ResponseEntity.ok(petService.getPetsByOwner(ownerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetResponse> getPetById(@PathVariable String id) {
        return ResponseEntity.ok(petService.getPetById(id));
    }

    @GetMapping("/{id}/terminate")
    public ResponseEntity<byte[]> terminatePetRegistry(
            @PathVariable String id,
            Authentication authentication) {
        String ownerId = getUserId(authentication);
        
        // 1. Generate the final report before data is wiped
        byte[] pdfReport = reportService.generatePetHealthReport(id);
        
        // 2. Wipe the pet and all its data
        petService.deletePet(id, ownerId);
        
        // 3. Return the PDF for download
        String filename = "Final_Report_Pet_" + id.substring(0, 5) + ".pdf";
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/pdf")
                .body(pdfReport);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetResponse> updatePet(
            @PathVariable String id,
            @Valid @RequestBody PetRequest request,
            Authentication authentication) {
        String ownerId = getUserId(authentication);
        return ResponseEntity.ok(petService.updatePet(id, request, ownerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deletePet(
            @PathVariable String id,
            Authentication authentication) {
        String ownerId = getUserId(authentication);
        petService.deletePet(id, ownerId);
        return ResponseEntity.ok(new MessageResponse("Pet registry deleted successfully", true));
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
