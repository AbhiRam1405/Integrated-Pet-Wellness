package com.petwellness.config;

import com.petwellness.model.Role;
import com.petwellness.model.User;
import com.petwellness.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Component to initialize default data in the database on startup.
 * Seeds a default admin account if none exists.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdminUser();
    }

    private void seedAdminUser() {
        String adminEmail = "admin@petwellness.com";
        String adminUsername = "admin";

        if (!userRepository.existsByEmail(adminEmail) && !userRepository.existsByUsername(adminUsername)) {
            log.info("Seeding default admin user...");
            
            User admin = User.builder()
                    .username(adminUsername)
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("System")
                    .lastName("Administrator")
                    .phoneNumber("0000000000")
                    .address("System")
                    .role(Role.ADMIN)
                    .isEmailVerified(true)
                    .isApproved(true)
                    .profileCompletionPercentage(100)
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(admin);
            log.info("========================================");
            log.info("DEFAULT ADMIN CREATED");
            log.info("Email: {}", adminEmail);
            log.info("Password: admin123");
            log.info("========================================");
        } else {
            log.info("Admin user already exists. Overwriting password to admin123 for consistency.");
            User admin = userRepository.findByEmail(adminEmail).orElseThrow();
            admin.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
            log.info("========================================");
            log.info("ADMIN PASSWORD RESET TO: admin123");
            log.info("========================================");
        }
    }
}
