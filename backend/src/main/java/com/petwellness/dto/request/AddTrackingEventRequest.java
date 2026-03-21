package com.petwellness.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for adding a tracking event to an order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddTrackingEventRequest {
    
    @NotBlank(message = "Status is required")
    private String status;
    
    private String location;
    
    @NotBlank(message = "Message is required")
    private String message;
}
