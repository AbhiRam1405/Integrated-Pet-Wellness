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
