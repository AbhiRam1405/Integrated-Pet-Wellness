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
                // Skip if not UPCOMING (Completed vaccinations don't need reminders)
                if (v.getStatus() != VaccinationStatus.UPCOMING) {
                    continue;
                }

                // Skip if nextDueDate is null (Null safety)
                if (v.getNextDueDate() == null) {
                    continue;
                }

                // Duplicate prevention: Don't send more than one email per day for the same record
                if (today.equals(v.getLastReminderDate())) {
                    continue;
                }

                boolean shouldSend = false;
                String reminderType = "";

                // A. 2-Day Reminder
                if (today.equals(v.getNextDueDate().minusDays(2)) && !v.isReminderSent()) {
                    shouldSend = true;
                    reminderType = "2-Day Reminder";
                    v.setReminderSent(true);
                } 
                // B. Due-Date Reminder
                else if (today.equals(v.getNextDueDate()) && !v.isDueDateReminderSent()) {
                    shouldSend = true;
                    reminderType = "Due-Date Reminder";
                    v.setDueDateReminderSent(true);
                }

                if (shouldSend) {
                    sendReminderEmail(v, reminderType);
                    v.setReminderCount(v.getReminderCount() + 1);
                    v.setLastReminderDate(today);
                    vaccinationRepository.save(v);
                }

            } catch (Exception e) {
                log.error("❌ Error processing reminder for vaccination ID: {}", v.getId(), e);
            }
        }
        log.info("✅ Vaccination reminder scheduler task completed.");
    }

    private void sendReminderEmail(Vaccination v, String type) {
        Pet pet = petRepository.findById(v.getPetId()).orElse(null);
        if (pet == null) {
            log.warn("Pet not found for vaccination ID: {}. Skipping email.", v.getId());
            return;
        }

        User owner = userRepository.findById(pet.getOwnerId()).orElse(null);
        if (owner == null || owner.getEmail() == null) {
            log.warn("Owner or email not found for pet ID: {}. Skipping email.", pet.getId());
            return;
        }

        String subject = "Vaccination Reminder – " + pet.getName();
        String body = String.format(
            "Dear %s,\n\n" +
            "This is a %s that your pet is due for a vaccination:\n\n" +
            "Pet Name: %s\n" +
            "Vaccine: %s\n" +
            "Due Date: %s\n\n" +
            "Please ensure your pet receives their vaccination on time to stay healthy.\n\n" +
            "Regards,\n" +
            "Pet Wellness System",
            owner.getFirstName() != null ? owner.getFirstName() : owner.getUsername(),
            type.toLowerCase(),
            pet.getName(),
            v.getVaccineName(),
            v.getNextDueDate()
        );

        emailService.sendEmail(owner.getEmail(), subject, body);
        log.info("📧 {} sent to {} for pet {}.", type, owner.getEmail(), pet.getName());
    }
}
