package com.petwellness.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating user profile.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    
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
    
    private String profileImageUrl;
    
    // Extended Profile Fields
    private java.time.LocalDate dateOfBirth;
    
    private String gender;
    
    private String bio;
    
    private String preferredLanguage;
    
    // Emergency Contact
    private String emergencyContactName;
    
    private String emergencyContactPhone;
    
    private String emergencyContactRelationship;
    
    // Social Media
    private String facebookUrl;
    
    private String instagramUrl;
    
    private String twitterUrl;
    
    private String linkedinUrl;
}
