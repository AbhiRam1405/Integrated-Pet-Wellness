package com.petwellness.controller;

import com.petwellness.dto.request.CreatePaymentOrderRequest;
import com.petwellness.dto.request.VerifyPaymentRequest;
import com.petwellness.dto.response.MessageResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.Payment;
import com.petwellness.model.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.OrderService;
import com.petwellness.service.PaymentService;
import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final OrderService orderService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreatePaymentOrderRequest request) {
        try {
            String userId = getUserId(authentication);
            Payment payment = paymentService.createOrder(request.getAmount(), userId);
            return ResponseEntity.ok(payment);
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            Authentication authentication,
            @Valid @RequestBody VerifyPaymentRequest request) {
        boolean isValid = paymentService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (isValid) {
            String userId = getUserId(authentication);
            // On successful verification, place the actual order
            return ResponseEntity.ok(orderService.placeOrder(request.getOrderRequest(), userId));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid payment signature", false));
        }
    }

    private String getUserId(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
