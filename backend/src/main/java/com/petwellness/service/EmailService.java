package com.petwellness.service;

import com.petwellness.model.*;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for sending HTML emails.
 */
@Slf4j
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name:Pet Wellness Service}")
    private String appName;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("📧 HTML Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("❌ Failed to send email to: {} | error: {}", to, e.getMessage());
        }
    }

    public void sendOtpEmail(String to, String otp) {
        String subject = "Verify Your PetWellness Account";
        String content = getHtmlWrapper("Email Verification", 
            "<p>Hello,</p>" +
            "<p>Thank you for joining PetWellness! To complete your registration, please use the following One-Time Password (OTP):</p>" +
            "<div style='background: #f1f5f9; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;'>" +
            "  <span style='font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #4f46e5;'>" + otp + "</span>" +
            "</div>" +
            "<p>This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>");
        sendEmail(to, subject, content);
    }

    public void sendWelcomeEmail(User user) {
        String fullName = (user.getFirstName() != null && !user.getFirstName().isEmpty()) ? user.getFirstName() : user.getUsername();
        String subject = "Welcome to " + appName + "!";
        String content = getHtmlWrapper("Welcome Aboard!", 
            "<p>Hi " + fullName + ",</p>" +
            "<p>We're thrilled to have you and your furry friends with us! Your account is now verified and active.</p>" +
            "<p>At " + appName + ", we're dedicated to making pet care seamless and joyful. You can now:</p>" +
            "<ul>" +
            "  <li>Manage your pet's health records</li>" +
            "  <li>Book appointments with top veterinarians</li>" +
            "  <li>Shop for premium pet supplies</li>" +
            "</ul>" +
            "<div style='text-align: center; margin: 30px 0;'>" +
            "  <a href='" + frontendUrl + "/dashboard' style='background: #4f46e5; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold;'>Go to Dashboard</a>" +
            "</div>");
        sendEmail(user.getEmail(), subject, content);
    }

    public void sendApprovalEmail(User user) {
        String fullName = (user.getFirstName() != null && !user.getFirstName().isEmpty()) ? user.getFirstName() : user.getUsername();
        String subject = "Account Approved - " + appName;
        String content = getHtmlWrapper("Account Approved!", 
            "<p>Hello " + fullName + ",</p>" +
            "<p>Great news! Your PetWellness account has been reviewed and approved by our administration team.</p>" +
            "<p>You now have full access to all features of our platform, including booking appointments and ordering supplies.</p>" +
            "<div style='text-align: center; margin: 30px 0;'>" +
            "  <a href='" + frontendUrl + "/login' style='background: #10b981; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold;'>Log In Now</a>" +
            "</div>" +
            "<p>We're excited to see you on the platform!</p>");
        sendEmail(user.getEmail(), subject, content);
    }

    public void sendRejectionEmail(String to, String reason) {
        String subject = "Account Application Update - " + appName;
        String content = getHtmlWrapper("Application Status", 
            "<p>Hello,</p>" +
            "<p>Thank you for your interest in " + appName + ". After reviewing your application, we regret to inform you that we cannot approve your account at this time.</p>" +
            "<div style='background: #fee2e2; padding: 20px; border-radius: 16px; border: 1px solid #fecaca; color: #991b1b; margin: 20px 0;'>" +
            "  <strong>Reason for Rejection:</strong><br/>" + reason + 
            "</div>" +
            "<p>If you have corrected these issues or believe this was an error, you are welcome to register again with accurate information.</p>");
        sendEmail(to, subject, content);
    }

    public void sendAppointmentBookingEmail(Appointment appointment, User user, String petName) {
        String subject = "Confirmation: Appointment for " + petName;
        String content = getHtmlWrapper("Appointment Confirmed", 
            "<p>Hello " + (user.getFirstName() != null ? user.getFirstName() : user.getUsername()) + ",</p>" +
            "<p>Your appointment has been successfully scheduled. Here are the details:</p>" +
            "<div style='background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0;'>" +
            "  <table style='width: 100%; border-collapse: collapse;'>" +
            "    <tr><td style='padding: 8px 0; color: #64748b; width: 100px;'>Pet:</td><td style='font-weight: bold;'>" + petName + "</td></tr>" +
            "    <tr><td style='padding: 8px 0; color: #64748b;'>Date:</td><td style='font-weight: bold;'>" + appointment.getAppointmentDate() + "</td></tr>" +
            "    <tr><td style='padding: 8px 0; color: #64748b;'>Time:</td><td style='font-weight: bold;'>" + appointment.getAppointmentTime() + "</td></tr>" +
            "    <tr><td style='padding: 8px 0; color: #64748b;'>Doctor:</td><td style='font-weight: bold;'>" + appointment.getVeterinarianName() + "</td></tr>" +
            "    <tr><td style='padding: 8px 0; color: #64748b;'>Type:</td><td style='font-weight: bold;'>" + appointment.getConsultationType() + "</td></tr>" +
            "  </table>" +
            "</div>" +
            "<p style='margin-top: 20px;'>If you need to reschedule or cancel, please do so via the appointments dashboard.</p>");
        sendEmail(user.getEmail(), subject, content);
    }

    public void sendOrderBookingEmail(Order order, User user, List<OrderItem> items) {
        String subject = "Order Confirmation #" + order.getId().substring(0, 8).toUpperCase();
        StringBuilder itemsHtml = new StringBuilder();
        for (OrderItem item : items) {
            itemsHtml.append("<tr><td style='padding: 10px 0; border-bottom: 1px solid #f1f5f9;'>")
                    .append(item.getProductName()).append(" x ").append(item.getQuantity())
                    .append("</td><td style='padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold;'>")
                    .append("₹").append(String.format("%.2f", item.getSubtotal())).append("</td></tr>");
        }

        String content = getHtmlWrapper("Order Received!", 
            "<p>Thank you for your order, " + (user.getFirstName() != null ? user.getFirstName() : user.getUsername()) + "!</p>" +
            "<p>We've received your order and are getting it ready for shipment.</p>" +
            "<h4>Order Summary:</h4>" +
            "<table style='width: 100%; border-collapse: collapse;'>" + itemsHtml.toString() + "</table>" +
            "<div style='text-align: right; padding-top: 20px; font-size: 18px;'>" +
            "  <strong>Total: ₹" + String.format("%.2f", order.getTotalAmount()) + "</strong>" +
            "</div>" +
            "<p style='margin-top: 20px;'><strong>Shipping to:</strong><br/>" + order.getShippingAddress() + "</p>");
        sendEmail(user.getEmail(), subject, content);
    }

    public void sendOrderStatusUpdateEmail(Order order, User user) {
        String subject = "Update: Your Order #" + order.getId().substring(0, 8).toUpperCase() + " is " + order.getStatus();
        String statusText = order.getStatus().toString();
        String accentColor = order.getStatus() == OrderStatus.DELIVERED ? "#10b981" : "#4f46e5";
        
        String content = getHtmlWrapper("Order Status Updated", 
            "<p>Hi " + (user.getFirstName() != null ? user.getFirstName() : user.getUsername()) + ",</p>" +
            "<p>The status of your order has been updated to:</p>" +
            "<div style='text-align: center; padding: 20px; margin: 20px 0; border-radius: 12px; background: #f8fafc;'>" +
            "  <span style='font-size: 24px; font-weight: 900; color: " + accentColor + "; text-transform: uppercase;'>" + statusText + "</span>" +
            "</div>" +
            "<p>You can track your order progress in real-time on our website.</p>" +
            "<div style='text-align: center; margin: 30px 0;'>" +
            "  <a href='" + frontendUrl + "/order-history' style='background: #4f46e5; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold;'>Track Order</a>" +
            "</div>");
        sendEmail(user.getEmail(), subject, content);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Reset Your PetWellness Password";
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        String content = getHtmlWrapper("Password Reset", 
            "<p>We received a request to reset your password. Click the button below to set a new one:</p>" +
            "<div style='text-align: center; margin: 30px 0;'>" +
            "  <a href='" + resetLink + "' style='background: #4f46e5; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold;'>Reset Password</a>" +
            "</div>" +
            "<p>This link will expire soon. If you didn't request this, you can safely ignore this email.</p>");
        sendEmail(to, subject, content);
    }

    public void sendReminderEmail(User owner, Pet pet, Appointment appt, String type) {
        String subject = "Appointment Reminder – " + pet.getName();
        String content = getHtmlWrapper("Upcoming Appointment", 
            "<p>Dear " + (owner.getFirstName() != null ? owner.getFirstName() : owner.getUsername()) + ",</p>" +
            "<p>This is a <strong>" + type.toLowerCase() + "</strong> that your pet has an appointment scheduled:</p>" +
            "<div style='background: #fff7ed; padding: 20px; border-radius: 16px; border: 1px solid #ffedd5;'>" +
            "  <table style='width: 100%; border-collapse: collapse;'>" +
            "    <tr><td style='padding: 8px 0; color: #9a3412; width: 100px;'>Pet:</td><td style='font-weight: bold;'>" + pet.getName() + "</td></tr>" +
            "    <tr><td style='padding: 8px 0; color: #9a3412;'>Date:</td><td style='font-weight: bold;'>" + appt.getAppointmentDate() + "</td></tr>" +
            "    <tr><td style='padding: 8px 0; color: #9a3412;'>Time:</td><td style='font-weight: bold;'>" + appt.getAppointmentTime() + "</td></tr>" +
            "    <tr><td style='padding: 8px 0; color: #9a3412;'>Doctor:</td><td style='font-weight: bold;'>" + appt.getVeterinarianName() + "</td></tr>" +
            "  </table>" +
            "</div>" +
            "<p style='margin-top: 20px;'>Please ensure you arrive on time for your consultation.</p>");
        sendEmail(owner.getEmail(), subject, content);
    }

    private String getHtmlWrapper(String title, String body) {
        return "<!DOCTYPE html><html><head>" +
               "<style>body{font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc;}" +
               ".container{max-width: 600px; margin: 0 auto; padding: 40px 20px;}" +
               ".header{text-align: center; margin-bottom: 40px;}" +
               ".card{background: white; padding: 40px; border-radius: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #f1f5f9;}" +
               ".footer{text-align: center; margin-top: 40px; color: #94a3b8; font-size: 13px; font-weight: 500;}" +
               "h1{color: #0f172a; margin-top: 0; font-weight: 900; letter-spacing: -0.025em; font-size: 28px; text-align: center; margin-bottom: 24px;}" +
               "p{margin-bottom: 16px; font-size: 16px; color: #475569;}" +
               "ul{padding-left: 20px; color: #475569;}" +
               "li{margin-bottom: 8px;}" +
               "</style></head><body>" +
               "<div class='container'><div class='header'><img src='https://cdn-icons-png.flaticon.com/512/616/616408.png' width='80' height='80' /></div>" +
               "<div class='card'><h1>" + title + "</h1>" + body + "</div>" +
               "<div class='footer'><p>&copy; " + java.time.Year.now().getValue() + " " + appName + " &bull; Crafted with Love</p></div>" +
               "</div></body></html>";
    }
}
