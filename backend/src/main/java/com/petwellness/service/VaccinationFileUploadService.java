package com.petwellness.service;

import com.petwellness.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling vaccination prescription file uploads.
 * Stores files in uploads/vaccinations/ directory.
 */
@Service
public class VaccinationFileUploadService {

    private final String uploadDir = "uploads/vaccinations/";
    private final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private final List<String> ALLOWED_EXTENSIONS = Arrays.asList("pdf", "jpg", "jpeg", "png");

    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // Validate: size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 5MB limit");
        }

        // Validate: extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new BadRequestException("Invalid file format");
        }
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Only PDF, JPG, and PNG files are allowed");
        }

        try {
            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String filename = UUID.randomUUID().toString() + "_" + originalFilename;
            Files.copy(file.getInputStream(), root.resolve(filename));

            return uploadDir + filename;
        } catch (IOException e) {
            throw new RuntimeException("Could not store the vaccination file. Error: " + e.getMessage());
        }
    }
}
