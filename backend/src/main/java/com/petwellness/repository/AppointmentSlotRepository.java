package com.petwellness.repository;

import com.petwellness.model.AppointmentSlot;
import com.petwellness.model.SlotStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for AppointmentSlot entity.
 */
@Repository
public interface AppointmentSlotRepository extends MongoRepository<AppointmentSlot, String> {
    
    List<AppointmentSlot> findByDate(LocalDate date);
    
    List<AppointmentSlot> findByStatus(SlotStatus status);
}
