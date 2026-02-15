package com.petwellness.service;

import com.petwellness.dto.request.ChangePasswordRequest;
import com.petwellness.dto.request.UpdateProfileRequest;
import com.petwellness.dto.response.UserProfileResponse;
import com.petwellness.exception.BadRequestException;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.Role;
import com.petwellness.model.User;
import com.petwellness.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user management and profile operations.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    /**
     * Get user profile by username.
     */
    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return mapToResponse(user);
    }

    /**
     * Update user profile.
     */
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        // Basic fields
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        
        // Location fields
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getZipCode() != null) user.setZipCode(request.getZipCode());
        
        // Pet information
        if (request.getPetCount() != null) user.setPetCount(request.getPetCount());
        if (request.getExperienceYears() != null) user.setExperienceYears(request.getExperienceYears());
        if (request.getPetPreferences() != null) user.setPetPreferences(request.getPetPreferences());
        
        // Profile image
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
        
        // Extended profile fields
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getPreferredLanguage() != null) user.setPreferredLanguage(request.getPreferredLanguage());
        
        // Emergency contact
        if (request.getEmergencyContactName() != null) user.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) user.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getEmergencyContactRelationship() != null) user.setEmergencyContactRelationship(request.getEmergencyContactRelationship());
        
        // Social media
        if (request.getFacebookUrl() != null) user.setFacebookUrl(request.getFacebookUrl());
        if (request.getInstagramUrl() != null) user.setInstagramUrl(request.getInstagramUrl());
        if (request.getTwitterUrl() != null) user.setTwitterUrl(request.getTwitterUrl());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());

        // Update profile completion percentage
        user.setProfileCompletionPercentage(calculateCompletion(user));

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    /**
     * Get current authenticated user's profile.
     * Extracts username from SecurityContext.
     */
    public UserProfileResponse getCurrentUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return getUserProfile(username);
    }

    /**
     * Change password for the current authenticated user.
     * Validates old password before updating to new password.
     */
    public void changePassword(ChangePasswordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        // Validate old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Encode and save new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Get all users pending approval (Admin only).
     */
    public List<UserProfileResponse> getPendingApprovals() {
        return userRepository.findByIsApprovedFalse().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Approve user by username (Admin only).
     */
    public void approveUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        user.setIsApproved(true);
        userRepository.save(user);
    }

    /**
     * Reject user by username (Admin only).
     * Sends a notification email with the reason before deleting the user record.
     */
    public void rejectUserByUsername(String username, String reason) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        emailService.sendRejectionEmail(user.getEmail(), reason);
        userRepository.delete(user);
    }

    /**
     * Get all users (Admin only).
     */
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Calculate profile completion percentage.
     */
    private int calculateCompletion(User user) {
        int fields = 0;
        int filled = 0;

        // Core fields
        fields++; if (user.getFirstName() != null && !user.getFirstName().isEmpty()) filled++;
        fields++; if (user.getLastName() != null && !user.getLastName().isEmpty()) filled++;
        fields++; if (user.getEmail() != null && !user.getEmail().isEmpty()) filled++;
        fields++; if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()) filled++;
        fields++; if (user.getAddress() != null && !user.getAddress().isEmpty()) filled++;

        return (filled * 100) / fields;
    }

    /**
     * Map User entity to UserProfileResponse DTO.
     */
    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(java.util.List.of("ROLE_" + user.getRole().name()))
                .isEmailVerified(user.getIsEmailVerified())
                .isApproved(user.getIsApproved())
                .profileCompletion(user.getProfileCompletionPercentage())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .country(user.getCountry())
                .zipCode(user.getZipCode())
                .petCount(user.getPetCount())
                .experienceYears(user.getExperienceYears())
                .petPreferences(user.getPetPreferences())
                .profileImageUrl(user.getProfileImageUrl())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .bio(user.getBio())
                .preferredLanguage(user.getPreferredLanguage())
                .emergencyContactName(user.getEmergencyContactName())
                .emergencyContactPhone(user.getEmergencyContactPhone())
                .emergencyContactRelationship(user.getEmergencyContactRelationship())
                .facebookUrl(user.getFacebookUrl())
                .instagramUrl(user.getInstagramUrl())
                .twitterUrl(user.getTwitterUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
