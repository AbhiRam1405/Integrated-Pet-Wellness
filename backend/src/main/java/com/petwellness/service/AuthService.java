package com.petwellness.service;

import com.petwellness.dto.request.LoginRequest;
import com.petwellness.dto.request.RegisterRequest;
import com.petwellness.dto.request.ResetPasswordRequest;
import com.petwellness.dto.request.VerifyOtpRequest;
import com.petwellness.dto.request.ResendOtpRequest;
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

import java.time.LocalDateTime;
import java.util.Random;

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
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .zipCode(request.getZipCode())
                .petCount(request.getPetCount())
                .experienceYears(request.getExperienceYears())
                .petPreferences(request.getPetPreferences())
                .role(Role.PET_OWNER)
                .isEmailVerified(false) // User must verify email via OTP
                .isApproved(false)
                .profileCompleted(false)
                .profileCompletionPercentage(0)
                .build();

        // Generate 6-digit OTP
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5)); // OTP expires in 5 minutes

        // Log OTP for testing (remove in production)
        System.out.println("🔐 OTP for " + request.getEmail() + ": " + otp);

        User savedUser = userRepository.save(user);
        
        // Send OTP email
        emailService.sendOtpEmail(savedUser.getEmail(), otp);

        return "Registration successful. Please check your email for OTP verification.";
    }

    /**
     * Authenticate user and return JWT.
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmailOrUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsernameOrEmail(request.getEmailOrUsername(), request.getEmailOrUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if email is verified and approved based on Role
        if (user.getRole() == Role.PET_OWNER) {
            // Strict checks for Pet Owner
            if (!Boolean.TRUE.equals(user.getIsEmailVerified())) {
                throw new org.springframework.security.access.AccessDeniedException("EMAIL_NOT_VERIFIED: Please verify your email address to continue.");
            }
            if (!Boolean.TRUE.equals(user.getIsApproved())) {
                throw new org.springframework.security.access.AccessDeniedException("APPROVAL_PENDING: Your account is awaiting administrator approval.");
            }
            // Note: Profile completion is NOT required for login
            // Users can login and complete their profile after authentication
        } else {
            // Standard checks for other roles
            if (!Boolean.TRUE.equals(user.getIsEmailVerified())) {
                throw new BadRequestException("Please verify your email before logging in");
            }
            if (!Boolean.TRUE.equals(user.getIsApproved())) {
                throw new BadRequestException("Your account is pending administrator approval");
            }
        }

        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(java.util.List.of("ROLE_" + user.getRole().name()))
                .message("Login successful")
                .build();
    }

    /**
     * Verify email address.
     */
    @Transactional
    public void verifyEmail(String token) {
        System.out.println("DEBUG: Verifying email with token: " + token);
        EmailVerificationToken verificationToken = tokenService.getVerificationToken(token);
        
        if (verificationToken == null) {
            System.err.println("DEBUG: Token not found in database");
            throw new BadRequestException("Invalid or expired verification token");
        }
        
        if (verificationToken.isExpired()) {
            System.err.println("DEBUG: Token is expired. Expiry: " + verificationToken.getExpiryDate());
            throw new BadRequestException("Invalid or expired verification token");
        }

        System.out.println("DEBUG: Token found for user: " + verificationToken.getUserId());
        User user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setIsEmailVerified(true);
        userRepository.save(user);
        tokenService.deleteVerificationToken(verificationToken);
        System.out.println("DEBUG: Email verification successful for user: " + user.getUsername());
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

    /**
     * Verify OTP for email verification.
     */
    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // Check if already verified
        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new BadRequestException("Email is already verified");
        }

        // Check if OTP matches
        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        // Check if OTP is expired
        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new BadRequestException("OTP has expired. Please request a new one");
        }

        // Verify email and clear OTP
        user.setIsEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    /**
     * Resend OTP for email verification.
     */
    @Transactional
    public void resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // Check if already verified
        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new BadRequestException("Email is already verified");
        }

        // Generate new OTP
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        
        // Log OTP for testing (remove in production)
        System.out.println("🔐 Resent OTP for " + request.getEmail() + ": " + otp);
        
        userRepository.save(user);

        // Send new OTP email
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    /**
     * Generate a random 6-digit OTP.
     */
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // Range: 100000 to 999999
        return String.valueOf(otp);
    }
}
