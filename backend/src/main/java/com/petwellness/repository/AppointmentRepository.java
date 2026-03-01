package com.petwellness.repository;

import com.petwellness.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Appointment entity.
 */
@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    
    List<Appointment> findByUserId(String userId);
    
    List<Appointment> findByPetId(String petId);
    
    List<Appointment> findBySlotId(String slotId);

    List<Appointment> findByAppointmentDateBetween(java.time.LocalDate startDate, java.time.LocalDate endDate);
}
