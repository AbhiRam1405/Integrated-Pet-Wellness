package com.petwellness.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for an individual item in a completed order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    private String id;
    private String orderId;
    private String productId;
    private String productName;
    private Integer quantity;
    private Double priceAtPurchase;
    private Double subtotal;
}
