package com.petwellness.service;

import com.petwellness.dto.request.LoginRequest;
import com.petwellness.dto.request.RegisterRequest;
import com.petwellness.dto.request.ResetPasswordRequest;
import com.petwellness.dto.response.AuthResponse;
import com.petwellness.exception.BadRequestException;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.EmailVerificationToken;
import com.petwellness.model.PasswordResetToken;
import com.petwellness.model.Role;
import com.petwellness.model.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for authentication operations (register, login, verification, password reset).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final TokenService tokenService;
    private final EmailService emailService;

    /**
     * Register a new user.
     */
    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .role(Role.PET_OWNER)
                .isEmailVerified(false)
                .isApproved(false) // Needs admin approval separately or auto-approve based on rules
                .profileCompletionPercentage(0)
                .build();

        User savedUser = userRepository.save(user);
        
        // Generate and send verification email
        String token = tokenService.createEmailVerificationToken(savedUser);
        emailService.sendVerificationEmail(savedUser.getEmail(), token);

        return "Registration successful. Please check your email for verification.";
    }

    /**
     * Authenticate user and return JWT.
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmailOrUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsernameOrEmail(request.getEmailOrUsername(), request.getEmailOrUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .message("Login successful")
                .build();
    }

    /**
     * Verify email address.
     */
    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenService.getVerificationToken(token);
        if (verificationToken == null || verificationToken.isExpired()) {
            throw new BadRequestException("Invalid or expired verification token");
        }

        User user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setIsEmailVerified(true);
        userRepository.save(user);
        tokenService.deleteVerificationToken(verificationToken);
    }

    /**
     * Initiate password reset.
     */
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        String token = tokenService.createPasswordResetToken(user);
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    /**
     * Reset password using token.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenService.getResetToken(request.getToken());
        if (resetToken == null || resetToken.isExpired()) {
            throw new BadRequestException("Invalid or expired password reset token");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        tokenService.deleteResetToken(resetToken);
    }
}
