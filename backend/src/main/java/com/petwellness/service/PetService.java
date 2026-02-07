package com.petwellness.service;

import com.petwellness.dto.request.PetRequest;
import com.petwellness.dto.response.PetResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.Pet;
import com.petwellness.repository.PetRepository;
import com.petwellness.repository.HealthRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for pet management.
 */
@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final HealthRecordRepository healthRecordRepository;

    /**
     * Register a new pet.
     */
    public PetResponse registerPet(PetRequest request, String ownerId) {
        Pet pet = Pet.builder()
                .name(request.getName())
                .type(request.getType())
                .breed(request.getBreed())
                .age(request.getAge())
                .gender(request.getGender())
                .ownerId(ownerId)
                .profileImageUrl(request.getProfileImageUrl())
                .bio(request.getBio())
                .weight(request.getWeight())
                .build();

        Pet savedPet = petRepository.save(pet);
        return mapToResponse(savedPet);
    }

    /**
     * Get all pets for a specific owner.
     */
    public List<PetResponse> getPetsByOwner(String ownerId) {
        return petRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get pet details by ID.
     */
    public PetResponse getPetById(String id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + id));
        return mapToResponse(pet);
    }

    /**
     * Update pet details.
     */
    public PetResponse updatePet(String id, PetRequest request, String ownerId) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + id));

        // Check ownership
        if (!pet.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized: You do not own this pet");
        }

        pet.setName(request.getName());
        pet.setType(request.getType());
        pet.setBreed(request.getBreed());
        pet.setAge(request.getAge());
        pet.setGender(request.getGender());
        pet.setProfileImageUrl(request.getProfileImageUrl());
        pet.setBio(request.getBio());
        pet.setWeight(request.getWeight());

        Pet updatedPet = petRepository.save(pet);
        return mapToResponse(updatedPet);
    }

    /**
     * Delete a pet and its associated health records.
     */
    @Transactional
    public void deletePet(String id, String ownerId) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + id));

        // Check ownership
        if (!pet.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized: You do not own this pet");
        }

        healthRecordRepository.deleteByPetId(id);
        petRepository.delete(pet);
    }

    /**
     * Map Pet entity to PetResponse DTO.
     */
    private PetResponse mapToResponse(Pet pet) {
        return PetResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .type(pet.getType())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .gender(pet.getGender())
                .ownerId(pet.getOwnerId())
                .profileImageUrl(pet.getProfileImageUrl())
                .bio(pet.getBio())
                .weight(pet.getWeight())
                .createdAt(pet.getCreatedAt())
                .updatedAt(pet.getUpdatedAt())
                .build();
    }
}
