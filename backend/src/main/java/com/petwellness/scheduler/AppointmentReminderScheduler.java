package com.petwellness.scheduler;

import com.petwellness.model.*;
import com.petwellness.repository.AppointmentRepository;
import com.petwellness.repository.PetRepository;
import com.petwellness.repository.UserRepository;
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
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    /**
     * Runs every day at 9 AM to send appointment reminders.
     * Cron: 0 0 9 * * ?
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendAppointmentReminders() {
        log.info("⏰ Starting appointment reminder scheduler task...");
        LocalDate today = LocalDate.now();
        LocalDate rangeEnd = today.plusDays(1); // Today and Tomorrow

        List<Appointment> appointments = appointmentRepository.findByAppointmentDateBetween(today, rangeEnd);
        log.info("Found {} appointments in proximity of date.", appointments.size());

        for (Appointment appt : appointments) {
            try {
                if (appt.getStatus() != AppointmentStatus.SCHEDULED) {
                    continue;
                }

                boolean shouldSend = false;
                String reminderType = "";

                // A. 1-Day Reminder (For Tomorrow)
                if (today.equals(appt.getAppointmentDate().minusDays(1)) && !appt.isReminderSent()) {
                    shouldSend = true;
                    reminderType = "1-Day Reminder";
                    appt.setReminderSent(true);
                } 
                // B. Same-Day Reminder (For Today)
                else if (today.equals(appt.getAppointmentDate()) && !appt.isDueDateReminderSent()) {
                    shouldSend = true;
                    reminderType = "Same-Day Reminder";
                    appt.setDueDateReminderSent(true);
                }

                if (shouldSend) {
                    sendReminderEmail(appt, reminderType);
                    appt.setReminderCount(appt.getReminderCount() + 1);
                    appt.setLastReminderDate(today);
                    appointmentRepository.save(appt);
                }

            } catch (Exception e) {
                log.error("❌ Error processing reminder for appointment ID: {}", appt.getId(), e);
            }
        }
        log.info("✅ Appointment reminder scheduler task completed.");
    }

    private void sendReminderEmail(Appointment appt, String type) {
        Pet pet = petRepository.findById(appt.getPetId()).orElse(null);
        if (pet == null) {
            log.warn("Pet not found for appointment ID: {}. Skipping email.", appt.getId());
            return;
        }

        User owner = userRepository.findById(appt.getUserId()).orElse(null);
        if (owner == null || owner.getEmail() == null) {
            log.warn("Owner or email not found for pet ID: {}. Skipping email.", pet.getId());
            return;
        }

        String subject = "Appointment Reminder – " + pet.getName();
        String body = String.format(
            "Dear %s,\n\n" +
            "This is a %s that your pet has an appointment scheduled:\n\n" +
            "Pet Name: %s\n" +
            "Veterinarian: %s\n" +
            "Date: %s\n" +
            "Time: %s\n" +
            "Type: %s\n\n" +
            "Please ensure you arrive on time for your consultation.\n\n" +
            "Regards,\n" +
            "Pet Wellness System",
            owner.getFirstName() != null ? owner.getFirstName() : owner.getUsername(),
            type.toLowerCase(),
            pet.getName(),
            appt.getVeterinarianName(),
            appt.getAppointmentDate(),
            appt.getAppointmentTime(),
            appt.getConsultationType()
        );

        emailService.sendEmail(owner.getEmail(), subject, body);
        log.info("📧 {} sent to {} for pet {}'s appointment.", type, owner.getEmail(), pet.getName());
    }
}
