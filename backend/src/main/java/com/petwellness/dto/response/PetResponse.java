package com.petwellness.dto.response;

import com.petwellness.model.PetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Pet details response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetResponse {
    
    private String id;
    
    private String name;
    
    private PetType type;
    
    private String breed;
    
    private Integer age;
    
    private String gender;
    
    private String ownerId;
    
    private String profileImageUrl;
    
    private String bio;
    
    private Double weight;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
