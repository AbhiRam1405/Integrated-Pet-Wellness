package com.petwellness.repository;

import com.petwellness.model.VaccinationAudit;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for VaccinationAudit documents.
 */
@Repository
public interface VaccinationAuditRepository extends MongoRepository<VaccinationAudit, String> {
    List<VaccinationAudit> findByVaccinationIdOrderByRevisionDesc(String vaccinationId);
}
