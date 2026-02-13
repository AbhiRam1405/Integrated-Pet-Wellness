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

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) user.setAddress(request.getAddress());

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
                .profileImageUrl(user.getProfileImageUrl())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
