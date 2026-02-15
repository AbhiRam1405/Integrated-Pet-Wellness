package com.petwellness.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * User entity representing a user in the Pet Wellness system.
 * Stores user authentication and profile information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    @Indexed(unique = true)
    private String email;
    
    private String password; // BCrypt hashed
    
    private Role role;
    
    private Boolean isEmailVerified;
    
    private Boolean isApproved;
    
    private Boolean profileCompleted;
    
    private Integer profileCompletionPercentage;
    
    private String firstName;
    
    private String lastName;
    
    private String phoneNumber;
    
    private String address;

    private String city;
    
    private String state;
    
    private String country;
    
    private String zipCode;
    
    private Integer petCount;
    
    private Integer experienceYears;
    
    private String petPreferences;
    
    private String profileImageUrl; // Optional profile image URL
    
    // Extended Profile Fields
    private java.time.LocalDate dateOfBirth;
    
    private String gender; // e.g., "Male", "Female", "Other", "Prefer not to say"
    
    private String bio; // About me / biography
    
    private String preferredLanguage; // e.g., "English", "Hindi", "Spanish"
    
    // Emergency Contact Information
    private String emergencyContactName;
    
    private String emergencyContactPhone;
    
    private String emergencyContactRelationship; // e.g., "Spouse", "Parent", "Friend"
    
    // Social Media Links
    private String facebookUrl;
    
    private String instagramUrl;
    
    private String twitterUrl;
    
    private String linkedinUrl;
    
    private String otp; // 6-digit OTP for email verification
    
    private LocalDateTime otpExpiry; // OTP expiration time
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    /**
     * Check if the user account is fully active (email verified and admin approved).
     * @return true if account is active
     */
    /**
     * Check if the user account is fully active according to Pet Owner rules.
     * Note: Profile completion is NOT required for login access.
     * @return true if account is active and eligible
     */
    public boolean isActivePetOwner() {
        if (this.role != Role.PET_OWNER) {
            return true; // Use different logic for other roles if needed, or assume true for now
        }
        // Only email verification and admin approval are required for login
        // Profile completion is optional and does not block access
        return Boolean.TRUE.equals(isEmailVerified) 
                && Boolean.TRUE.equals(isApproved);
    }
    
    /**
     * Check if the user account is active (generic check).
     * @return true if account is active
     */
    public boolean isActive() {
        return isActivePetOwner();
    }
}
