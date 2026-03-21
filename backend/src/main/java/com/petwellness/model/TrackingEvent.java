package com.petwellness.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Model representing a single tracking event for an order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingEvent {
    private String status;
    private String location;
    private String message;
    private LocalDateTime timestamp;
}
