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
    
    private Integer profileCompletionPercentage;
    
    private String firstName;
    
    private String lastName;
    
    private String phoneNumber;
    
    private String address;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    /**
     * Check if the user account is fully active (email verified and admin approved).
     * @return true if account is active
     */
    public boolean isActive() {
        return Boolean.TRUE.equals(isEmailVerified) && Boolean.TRUE.equals(isApproved);
    }
}
