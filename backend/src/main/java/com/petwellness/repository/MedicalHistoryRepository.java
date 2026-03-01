package com.petwellness.repository;

import com.petwellness.model.MedicalHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

/**
 * Repository interface for MedicalHistory entity.
 */
@Repository
public interface MedicalHistoryRepository extends MongoRepository<MedicalHistory, String> {
    
    /**
     * Find all medical history records for a specific pet.
     * @param petId the pet's ID
     * @param pageable the pagination information
     * @return page of medical history records
     */
    Page<MedicalHistory> findByPetId(String petId, Pageable pageable);

    /**
     * Find all medical history records for a specific pet, ordered by visit date descending.
     * @param petId the pet's ID
     * @return list of medical history records
     */
    List<MedicalHistory> findByPetIdOrderByVisitDateDesc(String petId);
}

