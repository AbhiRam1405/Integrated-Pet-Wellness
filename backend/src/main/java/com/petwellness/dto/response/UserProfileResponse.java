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
    
    private Role role;
    
    private Boolean isEmailVerified;
    
    private Boolean isApproved;
    
    private Integer profileCompletionPercentage;
    
    private String firstName;
    
    private String lastName;
    
    private String phoneNumber;
    
    private String address;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
