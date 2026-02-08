package com.petwellness.service;

import com.petwellness.dto.request.AddToCartRequest;
import com.petwellness.dto.request.UpdateCartItemRequest;
import com.petwellness.dto.response.CartItemResponse;
import com.petwellness.dto.response.CartResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.CartItem;
import com.petwellness.model.Product;
import com.petwellness.repository.CartItemRepository;
import com.petwellness.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing shopping cart items.
 */
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartRepository;
    private final ProductRepository productRepository;

    /**
     * Add an item to the user's cart.
     */
    @Transactional
    public CartItemResponse addToCart(AddToCartRequest request, String userId) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock available");
        }

        // Check if item already exists in cart for this user
        return cartRepository.findByUserIdAndProductId(userId, request.getProductId())
                .map(existingItem -> {
                    existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
                    return mapToResponse(cartRepository.save(existingItem));
                })
                .orElseGet(() -> {
                    CartItem newItem = CartItem.builder()
                            .userId(userId)
                            .productId(request.getProductId())
                            .productName(product.getName())
                            .productPrice(product.getPrice())
                            .quantity(request.getQuantity())
                            .build();
                    return mapToResponse(cartRepository.save(newItem));
                });
    }

    /**
     * Get user's current cart.
     */
    public CartResponse getMyCart(String userId) {
        List<CartItemResponse> items = cartRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        Double totalAmount = items.stream()
                .mapToDouble(item -> item.getProductPrice() * item.getQuantity())
                .sum();

        return CartResponse.builder()
                .items(items)
                .totalAmount(totalAmount)
                .build();
    }

    /**
     * Update cart item quantity.
     */
    public CartItemResponse updateQuantity(String itemId, UpdateCartItemRequest request, String userId) {
        CartItem item = cartRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: This cart item does not belong to you");
        }

        Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock available");
        }

        item.setQuantity(request.getQuantity());
        return mapToResponse(cartRepository.save(item));
    }

    /**
     * Remove an item from the cart.
     */
    public void removeItem(String itemId, String userId) {
        CartItem item = cartRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: This cart item does not belong to you");
        }

        cartRepository.delete(item);
    }

    /**
     * Clear the user's cart.
     */
    public void clearCart(String userId) {
        cartRepository.deleteByUserId(userId);
    }

    /**
     * Map entity to response DTO.
     */
    private CartItemResponse mapToResponse(CartItem item) {
        return CartItemResponse.builder()
                .id(item.getId())
                .userId(item.getUserId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .productPrice(item.getProductPrice())
                .quantity(item.getQuantity())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
