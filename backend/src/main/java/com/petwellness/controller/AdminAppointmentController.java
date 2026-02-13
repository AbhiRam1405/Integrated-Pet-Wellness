package com.petwellness.controller;

import com.petwellness.dto.request.CreateAppointmentSlotRequest;
import com.petwellness.dto.request.UpdateAppointmentSlotRequest;
import com.petwellness.dto.response.AppointmentResponse;
import com.petwellness.dto.response.AppointmentSlotResponse;
import com.petwellness.dto.response.MessageResponse;
import com.petwellness.service.AppointmentService;
import com.petwellness.service.AppointmentSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin controller for managing appointment slots and viewing all appointments.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAppointmentController {

    private final AppointmentSlotService slotService;
    private final AppointmentService appointmentService;

    @PostMapping("/appointments/slots")
    public ResponseEntity<AppointmentSlotResponse> createSlot(@Valid @RequestBody CreateAppointmentSlotRequest request) {
        return ResponseEntity.ok(slotService.createSlot(request));
    }

    @GetMapping("/appointments/slots")
    public ResponseEntity<List<AppointmentSlotResponse>> getAllSlots() {
        return ResponseEntity.ok(slotService.getAllSlots());
    }

    @GetMapping("/appointments/slots/{id}")
    public ResponseEntity<AppointmentSlotResponse> getSlotById(@PathVariable String id) {
        return ResponseEntity.ok(slotService.getSlotById(id));
    }

    @PutMapping("/appointments/slots/{id}")
    public ResponseEntity<AppointmentSlotResponse> updateSlot(
            @PathVariable String id,
            @Valid @RequestBody UpdateAppointmentSlotRequest request) {
        return ResponseEntity.ok(slotService.updateSlot(id, request));
    }

    @DeleteMapping("/appointments/slots/{id}")
    public ResponseEntity<MessageResponse> deleteSlot(@PathVariable String id) {
        slotService.deleteSlot(id);
        return ResponseEntity.ok(new MessageResponse("Slot deleted successfully", true));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }
}
