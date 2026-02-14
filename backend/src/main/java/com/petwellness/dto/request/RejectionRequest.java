package com.petwellness.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for rejecting a user with a reason.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectionRequest {
    
    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
