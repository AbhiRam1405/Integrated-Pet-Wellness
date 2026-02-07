package com.petwellness.repository;

import com.petwellness.model.HealthRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for HealthRecord entity.
 */
@Repository
public interface HealthRecordRepository extends MongoRepository<HealthRecord, String> {
    
    /**
     * Find all health records for a specific pet.
     * @param petId the pet's ID
     * @return list of health records
     */
    List<HealthRecord> findByPetIdOrderByDateDesc(String petId);
    
    /**
     * Delete all health records for a pet.
     * @param petId the pet's ID
     */
    void deleteByPetId(String petId);
}
