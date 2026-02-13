package com.petwellness.dto.request;

import com.petwellness.model.ProductCategory;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating an existing product.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {

    private String name;

    private String description;

    @Positive(message = "Price must be positive")
    private Double price;

    @PositiveOrZero(message = "Stock cannot be negative")
    private Integer stockQuantity;

    private ProductCategory category;

    private String imageUrl;
}
