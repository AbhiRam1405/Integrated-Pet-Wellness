package com.petwellness.service;

import com.petwellness.dto.request.PlaceOrderRequest;
import com.petwellness.dto.request.UpdateOrderStatusRequest;
import com.petwellness.dto.response.OrderItemResponse;
import com.petwellness.dto.response.OrderResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.*;
import com.petwellness.repository.CartItemRepository;
import com.petwellness.repository.OrderItemRepository;
import com.petwellness.repository.OrderRepository;
import com.petwellness.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for marketplace orders.
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartRepository;
    private final ProductRepository productRepository;

    /**
     * Place an order from the current cart.
     */
    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request, String userId) {
        List<CartItem> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cannot place order with an empty cart");
        }

        // 1. Calculate Total and Validate Stock
        double totalAmount = 0;
        for (CartItem item : cartItems) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.getProductName()));
            
            if (product.getStock() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            totalAmount += item.getProductPrice() * item.getQuantity();
        }

        // 2. Create Order
        Order order = Order.builder()
                .userId(userId)
                .orderDate(LocalDateTime.now())
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress())
                .phoneNumber(request.getPhoneNumber())
                .build();

        Order savedOrder = orderRepository.save(order);

        // 3. Create Order Items and Deduct Stock
        for (CartItem item : cartItems) {
            Product product = productRepository.findById(item.getProductId()).get();
            
            OrderItem orderItem = OrderItem.builder()
                    .orderId(savedOrder.getId())
                    .productId(item.getProductId())
                    .productName(item.getProductName())
                    .quantity(item.getQuantity())
                    .priceAtPurchase(item.getProductPrice())
                    .subtotal(item.getProductPrice() * item.getQuantity())
                    .build();
            orderItemRepository.save(orderItem);

            // Deduct Stock
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }

        // 4. Clear Cart
        cartRepository.deleteByUserId(userId);

        return getOrderById(savedOrder.getId(), userId, true);
    }

    /**
     * Get user's order history.
     */
    public List<OrderResponse> getMyOrders(String userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(order -> mapToResponse(order, orderItemRepository.findByOrderId(order.getId())))
                .collect(Collectors.toList());
    }

    /**
     * Get order details.
     */
    public OrderResponse getOrderById(String id, String userId, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (!isAdmin && !order.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order history");
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        return mapToResponse(order, items);
    }

    /**
     * Update order status (Admin).
     */
    public OrderResponse updateOrderStatus(String id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        order.setStatus(request.getStatus());
        Order updatedOrder = orderRepository.save(order);
        
        return getOrderById(updatedOrder.getId(), order.getUserId(), true);
    }

    /**
     * Cancel an order (User).
     */
    @Transactional
    public void cancelOrder(String id, String userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only cancel your own orders");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }

        // 1. Restore Stock
        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        for (OrderItem item : items) {
            productRepository.findById(item.getProductId()).ifPresent(product -> {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            });
        }

        // 2. Set Status
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    /**
     * Get all orders (Admin).
     */
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> mapToResponse(order, orderItemRepository.findByOrderId(order.getId())))
                .collect(Collectors.toList());
    }

    /**
     * Map entity to response DTO.
     */
    private OrderResponse mapToResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .orderId(item.getOrderId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .priceAtPurchase(item.getPriceAtPurchase())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .phoneNumber(order.getPhoneNumber())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
