package com.petwellness.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service for sending emails.
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Send email verification mail.
     */
    public void sendVerificationEmail(String to, String token) {
        String url = frontendUrl + "/verify-email?token=" + token;
        String subject = "Verify your email - Pet Wellness Service";
        String content = "Please click the link below to verify your email address:\n" + url;
        
        sendEmail(to, subject, content);
    }

    /**
     * Send password reset mail.
     */
    public void sendPasswordResetEmail(String to, String token) {
        String url = frontendUrl + "/reset-password?token=" + token;
        String subject = "Reset your password - Pet Wellness Service";
        String content = "Please click the link below to reset your password:\n" + url;
        
        sendEmail(to, subject, content);
    }

    /**
     * Send generic email.
     */
    private void sendEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }
}
