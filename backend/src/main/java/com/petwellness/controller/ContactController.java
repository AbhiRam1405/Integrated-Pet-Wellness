package com.petwellness.controller;

import com.petwellness.dto.request.ContactRequest;
import com.petwellness.dto.response.MessageResponse;
import com.petwellness.service.ContactService;
import com.petwellness.model.ContactMessage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for public contact inquiries.
 */
@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*") // Allow all origins for the public contact form
@RequiredArgsConstructor
public class ContactController {
    
    private final ContactService contactService;
    
    @PostMapping
    public ResponseEntity<MessageResponse> submitContact(@Valid @RequestBody ContactRequest request) {
        contactService.saveMessage(request);
        return ResponseEntity.ok(new MessageResponse("Message sent successfully", true));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(contactService.getAllMessages());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteMessage(@PathVariable String id) {
        contactService.deleteMessage(id);
        return ResponseEntity.ok(new MessageResponse("Message deleted successfully", true));
    }
}
