package com.petwellness.scheduler;

import com.petwellness.model.Pet;
import com.petwellness.model.User;
import com.petwellness.model.Vaccination;
import com.petwellness.model.VaccinationStatus;
import com.petwellness.repository.PetRepository;
import com.petwellness.repository.UserRepository;
import com.petwellness.repository.VaccinationRepository;
import com.petwellness.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class VaccinationReminderScheduler {

    private final VaccinationRepository vaccinationRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    /**
     * Runs every day at 9 AM to send vaccination reminders.
     * Cron: 0 0 9 * * ?
     * For testing, use: 0 * * * * ? (Every minute)
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendVaccinationReminders() {
        log.info("⏰ Starting vaccination reminder scheduler task...");
        LocalDate today = LocalDate.now();
        LocalDate rangeEnd = today.plusDays(2);

        // Fetch vaccinations due today or in the next 2 days
        List<Vaccination> vaccinations = vaccinationRepository.findByNextDueDateBetween(today, rangeEnd);
        log.info("Found {} vaccinations in proximity of due date.", vaccinations.size());

        for (Vaccination v : vaccinations) {
            try {
                // Null safety: Skip if nextDueDate is null
                if (v.getNextDueDate() == null) {
                    log.warn("Reminder skipped: nextDueDate is null | vaccinationId={}", v.getId());
                    continue;
                }

                // Skip if not UPCOMING (Completed vaccinations don't need reminders)
                if (v.getStatus() != VaccinationStatus.UPCOMING) {
                    continue;
                }

                // Duplicate prevention: Don't send more than one email per day for the same record
                if (today.equals(v.getLastReminderDate())) {
                    log.debug("Reminder already sent today: skipping | vaccinationId={} | date={}", v.getId(), today);
                    continue;
                }

                boolean shouldSend = false;
                String reminderType = "";

                // A. 2-Day Reminder
                if (today.equals(v.getNextDueDate().minusDays(2)) && !v.isReminderSent()) {
                    shouldSend = true;
                    reminderType = "2-day";
                    v.setReminderSent(true);
                } 
                // B. Due-Date Reminder
                else if (today.equals(v.getNextDueDate()) && !v.isDueDateReminderSent()) {
                    shouldSend = true;
                    reminderType = "due-date";
                    v.setDueDateReminderSent(true);
                }

                if (shouldSend) {
                    boolean success = sendReminderEmail(v, reminderType);
                    if (success) {
                        v.setReminderCount(v.getReminderCount() + 1);
                        v.setLastReminderDate(today);
                        vaccinationRepository.save(v);
                        log.info("Reminder sent | vaccinationId={} | petId={} | type={} | date={}", 
                                v.getId(), v.getPetId(), reminderType, today);
                    }
                }

            } catch (Exception e) {
                log.error("❌ Error processing reminder | vaccinationId={} | error={}", v.getId(), e.getMessage());
            }
        }
        log.info("✅ Vaccination reminder scheduler task completed.");
    }

    private boolean sendReminderEmail(Vaccination v, String type) {
        Pet pet = petRepository.findById(v.getPetId()).orElse(null);
        if (pet == null) {
            log.warn("Pet not found: skipping reminder | vaccinationId={} | petId={}", v.getId(), v.getPetId());
            return false;
        }

        User owner = userRepository.findById(pet.getOwnerId()).orElse(null);
        if (owner == null) {
            log.warn("Owner not found: skipping reminder | vaccinationId={} | petId={} | ownerId={}", 
                    v.getId(), pet.getId(), pet.getOwnerId());
            return false;
        }

        if (owner.getEmail() == null || owner.getEmail().trim().isEmpty()) {
            log.warn("Owner email missing: skipping reminder | vaccinationId={} | ownerId={}", 
                    v.getId(), owner.getId());
            return false;
        }

        String displayName = (owner.getFirstName() != null && !owner.getFirstName().isEmpty()) 
                             ? owner.getFirstName() : owner.getUsername();
        
        String subject = "Vaccination Reminder – " + pet.getName();
        String reminderTypeLabel = type.equals("2-day") ? "2-day reminder" : "scheduled due-date reminder";
        
        String body = String.format(
            "Dear %s,\n\n" +
            "This is a %s for your pet's upcoming vaccination:\n\n" +
            "Pet Name: %s\n" +
            "Vaccine: %s\n" +
            "Due Date: %s\n\n" +
            "Please ensure your pet receives their vaccination on time to maintain optimal health.\n\n" +
            "Regards,\n" +
            "Pet Wellness Management System",
            displayName,
            reminderTypeLabel,
            pet.getName(),
            v.getVaccineName(),
            v.getNextDueDate()
        );

        try {
            emailService.sendEmail(owner.getEmail(), subject, body);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email | vaccinationId={} | email={} | error={}", 
                    v.getId(), owner.getEmail(), e.getMessage());
            return false;
        }
    }
}
