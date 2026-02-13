package com.petwellness.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for an item in the cart.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private String id;
    private String userId;
    private String productId;
    private String productName;
    private Double productPrice;
    private Integer quantity;
    private Double subtotal;
    private String productImageUrl;
    private LocalDateTime createdAt;
}
