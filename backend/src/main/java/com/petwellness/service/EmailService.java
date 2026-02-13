package com.petwellness.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to: " + to);
            e.printStackTrace();
        }
    }

    public void sendOtpEmail(String to, String otp) {
        String subject = "Your OTP for PetWellness Verification";
        String body = "Hello,\n\nYour One-Time Password (OTP) for verification is: " + otp + 
                      "\n\nThis OTP is valid for 5 minutes. Please do not share this code with anyone.\n\nBest regards,\nThe PetWellness Team";
        sendEmail(to, subject, body);
    }
    
    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Reset Your PetWellness Password";
        // Assuming there is a frontend URL for password reset, using a placeholder for now
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        String body = "Hello,\n\nWe received a request to reset your password. Click the link below to set a new password:\n\n" + 
                      resetLink + "\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nThe PetWellness Team";
        sendEmail(to, subject, body);
    }
}
