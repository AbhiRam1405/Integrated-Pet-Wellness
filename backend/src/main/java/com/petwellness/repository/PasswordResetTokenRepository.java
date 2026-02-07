package com.petwellness.repository;

import com.petwellness.model.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for PasswordResetToken entity.
 */
@Repository
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    
    /**
     * Find token by token string.
     * @param token the token string
     * @return Optional containing token if found
     */
    Optional<PasswordResetToken> findByToken(String token);
    
    /**
     * Find token by user ID.
     * @param userId the user ID
     * @return Optional containing token if found
     */
    Optional<PasswordResetToken> findByUserId(String userId);
    
    /**
     * Delete all tokens for a user.
     * @param userId the user ID
     */
    void deleteByUserId(String userId);
}
