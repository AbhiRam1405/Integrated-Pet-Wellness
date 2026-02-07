package com.petwellness.service;

import com.petwellness.model.EmailVerificationToken;
import com.petwellness.model.PasswordResetToken;
import com.petwellness.model.User;
import com.petwellness.repository.EmailVerificationTokenRepository;
import com.petwellness.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for managing authentication-related tokens.
 */
@Service
@RequiredArgsConstructor
public class TokenService {

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    private static final long EMAIL_VERIFICATION_EXPIRATION = 24; // 24 hours
    private static final long PASSWORD_RESET_EXPIRATION = 1; // 1 hour

    /**
     * Create email verification token.
     */
    public String createEmailVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .token(token)
                .userId(user.getId())
                .expiryDate(LocalDateTime.now().plusHours(EMAIL_VERIFICATION_EXPIRATION))
                .build();
        
        emailVerificationTokenRepository.deleteByUserId(user.getId());
        emailVerificationTokenRepository.save(verificationToken);
        return token;
    }

    /**
     * Create password reset token.
     */
    public String createPasswordResetToken(User user) {
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .userId(user.getId())
                .expiryDate(LocalDateTime.now().plusHours(PASSWORD_RESET_EXPIRATION))
                .build();
        
        passwordResetTokenRepository.deleteByUserId(user.getId());
        passwordResetTokenRepository.save(resetToken);
        return token;
    }

    /**
     * Get email verification token.
     */
    public EmailVerificationToken getVerificationToken(String token) {
        return emailVerificationTokenRepository.findByToken(token).orElse(null);
    }

    /**
     * Get password reset token.
     */
    public PasswordResetToken getResetToken(String token) {
        return passwordResetTokenRepository.findByToken(token).orElse(null);
    }

    /**
     * Delete email verification token.
     */
    public void deleteVerificationToken(EmailVerificationToken token) {
        emailVerificationTokenRepository.delete(token);
    }

    /**
     * Delete password reset token.
     */
    public void deleteResetToken(PasswordResetToken token) {
        passwordResetTokenRepository.delete(token);
    }
}
