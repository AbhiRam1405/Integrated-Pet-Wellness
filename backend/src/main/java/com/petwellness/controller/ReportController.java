package com.petwellness.controller;

import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.exception.UnauthorizedAccessException;
import com.petwellness.model.Pet;
import com.petwellness.model.User;
import com.petwellness.repository.PetRepository;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    @GetMapping("/pet/{petId}")
    public ResponseEntity<byte[]> getPetHealthReport(
            @PathVariable String petId,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Security check: Verify pet ownership
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!pet.getOwnerId().equals(user.getId())) {
            throw new UnauthorizedAccessException("You do not have permission to access this report");
        }
        
        byte[] pdfBytes = reportService.generatePetHealthReport(petId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"pet-health-report-" + petId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
