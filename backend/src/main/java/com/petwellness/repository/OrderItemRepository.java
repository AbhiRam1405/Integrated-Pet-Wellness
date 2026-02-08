package com.petwellness.repository;

import com.petwellness.model.OrderItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for OrderItem entity.
 */
@Repository
public interface OrderItemRepository extends MongoRepository<OrderItem, String> {
    
    List<OrderItem> findByOrderId(String orderId);
}
