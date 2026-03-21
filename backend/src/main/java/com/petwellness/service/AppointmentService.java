package com.petwellness.service;

import com.petwellness.dto.request.BookAppointmentRequest;
import com.petwellness.dto.response.AppointmentResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.*;
import com.petwellness.repository.AppointmentRepository;
import com.petwellness.repository.AppointmentSlotRepository;
import com.petwellness.repository.PetRepository;
import com.petwellness.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Sort;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for booking and managing appointments.
 */
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentSlotRepository slotRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    /**
     * Book a new appointment.
     */
    @Transactional
    public AppointmentResponse bookAppointment(BookAppointmentRequest request, String userId) {
        // 1. Validate Slot
        AppointmentSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment slot not found"));

        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            throw new RuntimeException("This slot is no longer available");
        }

        // Check if slot time has already passed
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        if (slot.getDate().isBefore(today) || (slot.getDate().equals(today) && slot.getTime().isBefore(now))) {
            throw new RuntimeException("Cannot book a slot that has already passed");
        }

        // 2. Validate Pet Ownership
        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        if (!pet.getOwnerId().equals(userId)) {
            throw new RuntimeException("Unauthorized: This pet does not belong to you");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 3. Create Appointment
        Appointment appointment = Appointment.builder()
                .userId(userId)
                .petId(request.getPetId())
                .slotId(request.getSlotId())
                .appointmentDate(slot.getDate())
                .appointmentTime(slot.getTime())
                .consultationType(slot.getConsultationType())
                .veterinarianName(slot.getVeterinarianName())
                .status(AppointmentStatus.SCHEDULED)
                .notes(request.getNotes())
                .build();

        // 4. Update Slot Status
        slot.setStatus(SlotStatus.BOOKED);
        slotRepository.save(slot);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send confirmation email
        try {
            emailService.sendAppointmentBookingEmail(savedAppointment, user, pet.getName());
        } catch (Exception e) {
            // Log but don't fail the transaction just because email failed
            System.err.println("Failed to send appointment confirmation email: " + e.getMessage());
        }

        return mapToResponse(savedAppointment);
    }

    /**
     * Get appointments for the logged-in user.
     */
    public List<AppointmentResponse> getMyAppointments(String userId) {
        updatePastAppointments();
        return appointmentRepository.findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get appointment details.
     */
    public AppointmentResponse getAppointmentById(String id, String userId, boolean isAdmin) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!isAdmin && !appointment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to appointment");
        }

        return mapToResponse(appointment);
    }

    /**
     * Cancel an appointment.
     */
    @Transactional
    public void cancelAppointment(String id, String userId, boolean isAdmin) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!isAdmin && !appointment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only cancel your own appointments");
        }

        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new RuntimeException("Only scheduled appointments can be cancelled");
        }

        // 1. Update Appointment Status
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        // 2. Free up the slot
        AppointmentSlot slot = slotRepository.findById(appointment.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Associated slot not found"));
        slot.setStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);
    }

    /**
     * Get all appointments (Admin only).
     */
    public List<AppointmentResponse> getAllAppointments() {
        updatePastAppointments();
        return appointmentRepository.findAll(Sort.by(Sort.Direction.DESC, "appointmentDate", "appointmentTime")).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Finds and updates all past appointments that are still marked as SCHEDULED to COMPLETED.
     */
    @Transactional
    public void updatePastAppointments() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        
        List<Appointment> pastAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED)
                .filter(a -> a.getAppointmentDate().isBefore(today) || 
                       (a.getAppointmentDate().equals(today) && a.getAppointmentTime().isBefore(now)))
                .collect(Collectors.toList());

        if (!pastAppointments.isEmpty()) {
            pastAppointments.forEach(a -> a.setStatus(AppointmentStatus.COMPLETED));
            appointmentRepository.saveAll(pastAppointments);
            System.out.println("✅ Automatically updated " + pastAppointments.size() + " past appointments to COMPLETED.");
        }
    }

    /**
     * Map entity to response DTO.
     */
    private AppointmentResponse mapToResponse(Appointment appointment) {
        String petName = petRepository.findById(appointment.getPetId())
                .map(Pet::getName)
                .orElse("Unknown Pet");

        User owner = userRepository.findById(appointment.getUserId()).orElse(null);
        String ownerName = owner != null ? owner.getFirstName() + " " + owner.getLastName() : "Unknown Owner";
        String ownerEmail = owner != null ? owner.getEmail() : "N/A";

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .userId(appointment.getUserId())
                .petId(appointment.getPetId())
                .petName(petName)
                .ownerName(ownerName)
                .ownerEmail(ownerEmail)
                .slotId(appointment.getSlotId())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .consultationType(appointment.getConsultationType())
                .veterinarianName(appointment.getVeterinarianName())
                .status(appointment.getStatus())
                .notes(appointment.getNotes())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }
}
