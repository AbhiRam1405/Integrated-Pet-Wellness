package com.petwellness.service;

import com.petwellness.dto.request.ContactRequest;
import com.petwellness.model.ContactMessage;
import com.petwellness.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service for handling contact messages.
 */
@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ContactService {
    
    private final ContactMessageRepository contactMessageRepository;
    
    /**
     * Save a new contact message.
     */
    public void saveMessage(ContactRequest request) {
        log.info("Saving contact message from: {}", request.getEmail());
        ContactMessage contactMessage = ContactMessage.builder()
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .createdAt(java.time.LocalDateTime.now()) // Ensure timestamp is set for sorting
                .build();
        
        ContactMessage saved = contactMessageRepository.save(contactMessage);
        log.info("Saved contact message with ID: {}", saved.getId());
    }

    /**
     * Get all contact messages, sorted by latest first.
     */
    public java.util.List<ContactMessage> getAllMessages() {
        log.info("Fetching all contact messages");
        java.util.List<ContactMessage> messages = contactMessageRepository.findAll();
        log.info("Found {} messages in database", messages.size());
        
        return messages.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Delete a contact message by ID.
     */
    public void deleteMessage(String id) {
        log.info("Deleting contact message with ID: {}", id);
        contactMessageRepository.deleteById(id);
    }
}
