package com.petwellness.service;

import com.petwellness.dto.request.CreateAppointmentSlotRequest;
import com.petwellness.dto.request.UpdateAppointmentSlotRequest;
import com.petwellness.dto.response.AppointmentSlotResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.AppointmentSlot;
import com.petwellness.model.SlotStatus;
import com.petwellness.repository.AppointmentSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing appointment slots.
 */
@Service
@RequiredArgsConstructor
public class AppointmentSlotService {

    private final AppointmentSlotRepository slotRepository;

    /**
     * Create a new appointment slot.
     */
    public AppointmentSlotResponse createSlot(CreateAppointmentSlotRequest request) {
        AppointmentSlot slot = AppointmentSlot.builder()
                .date(request.getDate())
                .time(request.getTime())
                .consultationType(request.getConsultationType())
                .veterinarianName(request.getVeterinarianName())
                .duration(request.getDuration())
                .status(SlotStatus.AVAILABLE)
                .build();

        AppointmentSlot savedSlot = slotRepository.save(slot);
        return mapToResponse(savedSlot);
    }

    /**
     * Update an appointment slot.
     */
    public AppointmentSlotResponse updateSlot(String id, UpdateAppointmentSlotRequest request) {
        AppointmentSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + id));

        if (request.getDate() != null) slot.setDate(request.getDate());
        if (request.getTime() != null) slot.setTime(request.getTime());
        if (request.getConsultationType() != null) slot.setConsultationType(request.getConsultationType());
        if (request.getVeterinarianName() != null) slot.setVeterinarianName(request.getVeterinarianName());
        if (request.getStatus() != null) slot.setStatus(request.getStatus());
        if (request.getDuration() != null) slot.setDuration(request.getDuration());

        AppointmentSlot updatedSlot = slotRepository.save(slot);
        return mapToResponse(updatedSlot);
    }

    /**
     * Delete an appointment slot.
     */
    public void deleteSlot(String id) {
        AppointmentSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + id));

        if (slot.getStatus() == SlotStatus.BOOKED) {
            throw new RuntimeException("Cannot delete a booked slot. Cancel the appointment first.");
        }

        slotRepository.delete(slot);
    }

    /**
     * Get all appointment slots.
     */
    public List<AppointmentSlotResponse> getAllSlots() {
        return slotRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get only available slots.
     */
    public List<AppointmentSlotResponse> getAvailableSlots() {
        return slotRepository.findByStatus(SlotStatus.AVAILABLE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get slot by ID.
     */
    public AppointmentSlotResponse getSlotById(String id) {
        AppointmentSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + id));
        return mapToResponse(slot);
    }

    /**
     * Map entity to response DTO.
     */
    private AppointmentSlotResponse mapToResponse(AppointmentSlot slot) {
        return AppointmentSlotResponse.builder()
                .id(slot.getId())
                .date(slot.getDate())
                .time(slot.getTime())
                .consultationType(slot.getConsultationType())
                .veterinarianName(slot.getVeterinarianName())
                .status(slot.getStatus())
                .duration(slot.getDuration())
                .createdAt(slot.getCreatedAt())
                .updatedAt(slot.getUpdatedAt())
                .build();
    }
}
