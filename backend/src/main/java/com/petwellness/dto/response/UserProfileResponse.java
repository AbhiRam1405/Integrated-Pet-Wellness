package com.petwellness.dto.response;

import com.petwellness.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user profile responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    
    private String id;
    
    private String username;
    
    private String email;
    
    private Role role; // Keep for backend internal use if needed, but let's add roles list
    
    private java.util.List<String> roles;
    
    private Boolean isEmailVerified;
    
    private Boolean isApproved;
    
    private Integer profileCompletion;
    
    private String firstName;
    
    private String lastName;
    
    private String phoneNumber;
    
    private String address;
    
    private String profileImageUrl;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
