package com.petwellness.controller;

import com.petwellness.dto.request.ChangePasswordRequest;
import com.petwellness.dto.request.UpdateProfileRequest;
import com.petwellness.dto.response.MessageResponse;
import com.petwellness.dto.response.UserProfileResponse;
import com.petwellness.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for user profile management.
 * All endpoints require JWT authentication.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get current logged-in user's profile.
     * Extracts user from JWT token automatically.
     * 
     * @return UserProfileResponse with user details (password excluded)
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile() {
        UserProfileResponse profile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(profile);
    }

    /**
     * Update current user's profile.
     * Only allows updating: firstName, lastName, phoneNumber, address.
     * Cannot update: email, role, isEmailVerified, password.
     * 
     * @param request UpdateProfileRequest with fields to update
     * @return Updated UserProfileResponse
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfileResponse updatedProfile = userService.updateProfile(username, request);
        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * Change password for current user.
     * Validates old password before allowing change.
     * New password is encrypted using BCrypt.
     * 
     * @param request ChangePasswordRequest with oldPassword and newPassword
     * @return Success message
     */
    @PutMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(new MessageResponse("Password changed successfully", true));
    }
}
