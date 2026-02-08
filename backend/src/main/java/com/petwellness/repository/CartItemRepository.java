package com.petwellness.repository;

import com.petwellness.model.CartItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for CartItem entity.
 */
@Repository
public interface CartItemRepository extends MongoRepository<CartItem, String> {
    
    List<CartItem> findByUserId(String userId);
    
    Optional<CartItem> findByUserIdAndProductId(String userId, String productId);
    
    void deleteByUserId(String userId);
}
