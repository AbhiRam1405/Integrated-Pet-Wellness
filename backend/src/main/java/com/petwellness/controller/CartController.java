package com.petwellness.controller;

import com.petwellness.dto.request.AddToCartRequest;
import com.petwellness.dto.request.UpdateCartItemRequest;
import com.petwellness.dto.response.CartItemResponse;
import com.petwellness.dto.response.CartResponse;
import com.petwellness.dto.response.MessageResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing the user's shopping cart.
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequest request) {
        String userId = getUserId(authentication);
        cartService.addToCart(request, userId);
        return ResponseEntity.ok(cartService.getMyCart(userId));
    }

    @GetMapping
    public ResponseEntity<CartResponse> getMyCart(Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(cartService.getMyCart(userId));
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable String itemId,
            Authentication authentication,
            @Valid @RequestBody UpdateCartItemRequest request) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(cartService.updateQuantity(itemId, request, userId));
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable String itemId,
            Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(cartService.removeItem(itemId, userId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<MessageResponse> clearCart(Authentication authentication) {
        String userId = getUserId(authentication);
        cartService.clearCart(userId);
        return ResponseEntity.ok(new MessageResponse("Cart cleared successfully", true));
    }

    private String getUserId(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
