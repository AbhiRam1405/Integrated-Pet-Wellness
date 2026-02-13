package com.petwellness.controller;

import com.petwellness.dto.response.MessageResponse;
import com.petwellness.dto.response.UserProfileResponse;
import com.petwellness.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for admin-only endpoints.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    @GetMapping("/users/pending")
    public ResponseEntity<List<UserProfileResponse>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingApprovals());
    }

    @PutMapping("/users/{username}/approve")
    public ResponseEntity<MessageResponse> approveUser(@PathVariable String username) {
        userService.approveUserByUsername(username);
        return ResponseEntity.ok(new MessageResponse("User approved successfully", true));
    }
}
