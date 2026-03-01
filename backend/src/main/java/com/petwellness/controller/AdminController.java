package com.petwellness.controller;

import com.petwellness.dto.request.RejectionRequest;
import com.petwellness.dto.response.MessageResponse;
import com.petwellness.dto.response.UserProfileResponse;
import com.petwellness.service.UserService;
import jakarta.validation.Valid;
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
    private final com.petwellness.scheduler.VaccinationReminderScheduler vaccinationScheduler;
    private final com.petwellness.scheduler.AppointmentReminderScheduler appointmentScheduler;

    @GetMapping("/users/pending")
    public ResponseEntity<List<UserProfileResponse>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingApprovals());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{username}/approve")
    public ResponseEntity<MessageResponse> approveUser(@PathVariable String username) {
        userService.approveUserByUsername(username);
        return ResponseEntity.ok(new MessageResponse("User approved successfully", true));
    }

    @DeleteMapping("/users/{username}")
    public ResponseEntity<MessageResponse> rejectUser(
            @PathVariable String username,
            @Valid @RequestBody RejectionRequest request) {
        userService.rejectUserByUsername(username, request.getReason());
        return ResponseEntity.ok(new MessageResponse("User rejected and notified successfully", true));
    }

    @PostMapping("/reminders/vaccinations/trigger")
    public ResponseEntity<MessageResponse> triggerVaccinationReminders() {
        vaccinationScheduler.sendVaccinationReminders();
        return ResponseEntity.ok(new MessageResponse("Vaccination reminders triggered successfully", true));
    }

    @PostMapping("/reminders/appointments/trigger")
    public ResponseEntity<MessageResponse> triggerAppointmentReminders() {
        appointmentScheduler.sendAppointmentReminders();
        return ResponseEntity.ok(new MessageResponse("Appointment reminders triggered successfully", true));
    }
}
