package com.petwellness.repository;

import com.petwellness.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    /**
     * Find user by username.
     * @param username the username
     * @return Optional containing user if found
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find user by email.
     * @param email the email
     * @return Optional containing user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find user by username or email.
     * @param username the username
     * @param email the email
     * @return Optional containing user if found
     */
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    /**
     * Check if username exists.
     * @param username the username
     * @return true if exists
     */
    boolean existsByUsername(String username);
    
    /**
     * Check if email exists.
     * @param email the email
     * @return true if exists
     */
    boolean existsByEmail(String email);
    
    /**
     * Find all users pending admin approval.
     * @return list of users
     */
    List<User> findByIsApprovedFalse();
}
