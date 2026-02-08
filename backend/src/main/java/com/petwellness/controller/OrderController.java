package com.petwellness.controller;

import com.petwellness.dto.request.PlaceOrderRequest;
import com.petwellness.dto.response.MessageResponse;
import com.petwellness.dto.response.OrderResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for users to manage their marketplace orders.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @PostMapping("/place")
    public ResponseEntity<OrderResponse> placeOrder(
            Authentication authentication,
            @Valid @RequestBody PlaceOrderRequest request) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(orderService.placeOrder(request, userId));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderDetails(
            @PathVariable String id,
            Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(orderService.getOrderById(id, userId, false));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<MessageResponse> cancelOrder(
            @PathVariable String id,
            Authentication authentication) {
        String userId = getUserId(authentication);
        orderService.cancelOrder(id, userId);
        return ResponseEntity.ok(new MessageResponse("Order cancelled successfully", true));
    }

    private String getUserId(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
