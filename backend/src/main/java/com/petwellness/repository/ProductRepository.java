package com.petwellness.repository;

import com.petwellness.model.Product;
import com.petwellness.model.ProductCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Product entity.
 */
@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    
    List<Product> findByCategory(ProductCategory category);
    
    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    List<Product> searchByName(String query);
}
