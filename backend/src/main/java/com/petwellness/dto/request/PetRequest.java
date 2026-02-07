package com.petwellness.dto.request;

import com.petwellness.model.PetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating a Pet.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetRequest {
    
    @NotBlank(message = "Pet name is required")
    private String name;
    
    @NotNull(message = "Pet type is required")
    private PetType type;
    
    private String breed;
    
    private Integer age;
    
    private String gender;
    
    private String profileImageUrl;
    
    private String bio;
    
    private Double weight;
}
