package com.petwellness.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Model representing an individual item within an order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "order_items")
public class OrderItem {

    @Id
    private String id;

    @Indexed
    private String orderId;

    private String productId;

    private String productName;

    private Integer quantity;

    private Double priceAtPurchase;

    private Double subtotal;
}
