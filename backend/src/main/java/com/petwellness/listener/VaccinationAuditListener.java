package com.petwellness.listener;

import com.petwellness.model.Vaccination;
import com.petwellness.model.VaccinationAudit;
import com.petwellness.repository.VaccinationAuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Listener to automatically capture snapshots of Vaccination records for auditing.
 */
@Component
@RequiredArgsConstructor
public class VaccinationAuditListener extends AbstractMongoEventListener<Vaccination> {

    private final VaccinationAuditRepository auditRepository;

    @Override
    public void onAfterSave(AfterSaveEvent<Vaccination> event) {
        Vaccination vaccination = event.getSource();
        
        // In onAfterSave, the version in the source entity is the one just saved.
        // Spring Data MongoDB @Version starts at 0 for new entities.
        String revisionType = (vaccination.getVersion() != null && vaccination.getVersion() == 0) ? "ADD" : "MOD";
        
        VaccinationAudit audit = VaccinationAudit.builder()
                .vaccinationId(vaccination.getId())
                .petId(vaccination.getPetId())
                .vaccineName(vaccination.getVaccineName())
                .doctorName(vaccination.getDoctorName())
                .lastGivenDate(vaccination.getLastGivenDate())
                .givenDate(vaccination.getGivenDate())
                .nextDueDate(vaccination.getNextDueDate())
                .status(vaccination.getStatus())
                .doseNumber(vaccination.getDoseNumber())
                .revision(vaccination.getVersion())
                .revisionType(revisionType)
                .revisionTimestamp(LocalDateTime.now())
                .reminderSent(vaccination.isReminderSent())
                .reminderCount(vaccination.getReminderCount())
                .attachmentPath(vaccination.getAttachmentPath())
                .build();
        
        auditRepository.save(audit);
    }
}
