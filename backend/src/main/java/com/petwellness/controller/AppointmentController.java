package com.petwellness.controller;

import com.petwellness.dto.request.BookAppointmentRequest;
import com.petwellness.dto.response.AppointmentResponse;
import com.petwellness.dto.response.AppointmentSlotResponse;
import com.petwellness.dto.response.MessageResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.User;
import com.petwellness.repository.UserRepository;
import com.petwellness.service.AppointmentService;
import com.petwellness.service.AppointmentSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for users to manage their appointments and view available slots.
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppointmentSlotService slotService;
    private final UserRepository userRepository;

    @GetMapping("/slots/available")
    public ResponseEntity<List<AppointmentSlotResponse>> getAvailableSlots() {
        return ResponseEntity.ok(slotService.getAvailableSlots());
    }

    @PostMapping("/book")
    public ResponseEntity<AppointmentResponse> bookAppointment(
            Authentication authentication,
            @Valid @RequestBody BookAppointmentRequest request) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(appointmentService.bookAppointment(request, userId));
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(appointmentService.getMyAppointments(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentDetails(
            @PathVariable String id,
            Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(appointmentService.getAppointmentById(id, userId, false));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<MessageResponse> cancelAppointment(
            @PathVariable String id,
            Authentication authentication) {
        String userId = getUserId(authentication);
        appointmentService.cancelAppointment(id, userId, false);
        return ResponseEntity.ok(new MessageResponse("Appointment cancelled successfully", true));
    }

    private String getUserId(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
