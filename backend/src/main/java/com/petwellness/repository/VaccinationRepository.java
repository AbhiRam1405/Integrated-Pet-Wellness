package com.petwellness.repository;

import com.petwellness.model.Vaccination;
import com.petwellness.model.VaccinationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Vaccination documents.
 */
@Repository
public interface VaccinationRepository extends MongoRepository<Vaccination, String> {

    Page<Vaccination> findByPetId(String petId, Pageable pageable);

    List<Vaccination> findByPetIdOrderByNextDueDateAsc(String petId);

    Optional<Vaccination> findTopByPetIdAndVaccineNameOrderByDoseNumberDesc(String petId, String vaccineName);

    boolean existsByPetIdAndVaccineNameAndStatusIn(String petId, String vaccineName, List<VaccinationStatus> statuses);


    List<Vaccination> findByStatus(VaccinationStatus status);

    List<Vaccination> findByStatusAndNextDueDateBefore(VaccinationStatus status, LocalDate date);

    List<Vaccination> findByStatusAndNextDueDate(VaccinationStatus status, LocalDate date);

    List<Vaccination> findByStatusAndGivenDateBefore(VaccinationStatus status, LocalDate date);

    List<Vaccination> findByNextDueDateBetween(LocalDate startDate, LocalDate endDate);

    List<Vaccination> findByPetIdOrderByDoseNumberDesc(String petId);
}
