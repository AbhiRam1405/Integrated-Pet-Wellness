package com.petwellness;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for the Pet Wellness Service.
 */
@SpringBootApplication
@EnableMongoAuditing
@EnableScheduling
public class PetWellnessApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetWellnessApplication.class, args);
    }
}
