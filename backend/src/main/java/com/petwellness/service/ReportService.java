package com.petwellness.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.petwellness.dto.response.PetHealthReportResponse;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.model.*;
import com.petwellness.repository.MedicalHistoryRepository;
import com.petwellness.repository.PetRepository;
import com.petwellness.repository.AppointmentRepository;
import com.petwellness.repository.UserRepository;
import com.petwellness.repository.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final PetRepository petRepository;
    private final MedicalHistoryRepository medicalHistoryRepository;
    private final VaccinationRepository vaccinationRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public byte[] generatePetHealthReport(String petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        User owner = userRepository.findById(pet.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        List<MedicalHistory> medicalHistories = medicalHistoryRepository.findByPetIdOrderByVisitDateDesc(petId);
        List<Vaccination> vaccinations = vaccinationRepository.findByPetIdOrderByDoseNumberDesc(petId);
        List<Appointment> appointments = appointmentRepository.findByPetIdOrderByAppointmentDateDescAppointmentTimeDesc(petId);

        PetHealthReportResponse reportData = assembleReportData(pet, owner, medicalHistories, vaccinations, appointments);
        return generatePdf(reportData);
    }

    private PetHealthReportResponse assembleReportData(Pet pet, User owner, List<MedicalHistory> medicalHistories, 
                                                        List<Vaccination> vaccinations, List<Appointment> appointments) {
        return PetHealthReportResponse.builder()
                .petInfo(PetHealthReportResponse.PetInfo.builder()
                        .petName(pet.getName())
                        .breed(pet.getBreed())
                        .age(pet.getAge() + " years")
                        .gender(pet.getGender())
                        .ownerName(owner.getUsername())
                        .build())
                .medicalHistory(medicalHistories.stream()
                        .map(mh -> PetHealthReportResponse.MedicalHistoryInfo.builder()
                                .visitDate(mh.getVisitDate())
                                .doctorName(mh.getDoctorName())
                                .diagnosis(mh.getDiagnosis())
                                .treatment(mh.getTreatment())
                                .followUpDate(mh.getFollowUpDate())
                                .build())
                        .collect(Collectors.toList()))
                .vaccinations(vaccinations.stream()
                        .map(v -> PetHealthReportResponse.VaccinationInfo.builder()
                                .vaccineName(v.getVaccineName())
                                .doctorName(v.getDoctorName())
                                .doseNumber(v.getDoseNumber())
                                .givenDate(v.getGivenDate())
                                .nextDueDate(v.getNextDueDate())
                                .status(calculateStatus(v).toString())
                                .build())
                        .collect(Collectors.toList()))
                .appointments(appointments.stream()
                        .map(a -> PetHealthReportResponse.AppointmentInfo.builder()
                                .appointmentDate(a.getAppointmentDate())
                                .appointmentTime(a.getAppointmentTime() != null ? a.getAppointmentTime().toString() : "")
                                .veterinarianName(a.getVeterinarianName())
                                .consultationType(a.getConsultationType() != null ? a.getConsultationType().toString() : "")
                                .status("SCHEDULED")
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private VaccinationStatus calculateStatus(Vaccination v) {
        if (v.getStatus() == VaccinationStatus.COMPLETED) {
            return VaccinationStatus.COMPLETED;
        }
        LocalDate today = LocalDate.now();
        if (v.getGivenDate() != null && today.isAfter(v.getGivenDate())) {
            return VaccinationStatus.OVERDUE;
        }
        if (v.getNextDueDate() != null && today.isAfter(v.getNextDueDate())) {
            return VaccinationStatus.OVERDUE;
        }
        return VaccinationStatus.UPCOMING;
    }

    private byte[] generatePdf(PetHealthReportResponse data) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(document, out);

        document.open();

        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.BLACK);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLACK);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY);

        // --- 1. Top Header Table ---
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setSpacingAfter(20f);
        try {
            headerTable.setWidths(new float[]{60, 40});
        } catch (DocumentException e) {}

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        Paragraph title = new Paragraph("Pet History Report", titleFont);
        title.setSpacingAfter(5f);
        leftCell.addElement(title);
        leftCell.addElement(new Paragraph("Generated on: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")), normalFont));
        headerTable.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        Paragraph petInfo = new Paragraph();
        petInfo.setAlignment(Element.ALIGN_RIGHT);
        petInfo.add(new Phrase("Pet Name: " + data.getPetInfo().getPetName() + "\n", headerFont));
        petInfo.add(new Phrase("Breed: " + data.getPetInfo().getBreed() + "\n", normalFont));
        petInfo.add(new Phrase("Age: " + data.getPetInfo().getAge() + "\n", normalFont));
        petInfo.add(new Phrase("Gender: " + data.getPetInfo().getGender() + "\n", normalFont));
        rightCell.addElement(petInfo);
        headerTable.addCell(rightCell);

        document.add(headerTable);

        // --- 2. Appointment History ---
        Paragraph apptTitle = new Paragraph("Appointment History", sectionFont);
        apptTitle.setSpacingAfter(10f);
        document.add(apptTitle);

        if (data.getAppointments().isEmpty()) {
            document.add(new Paragraph("No appointments found.", normalFont));
        } else {
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingAfter(15f);
            String[] headers = {"Date", "Time", "Veterinarian", "Type"};
            for (String h : headers) {
                PdfPCell c = new PdfPCell(new Phrase(h, headerFont));
                c.setBackgroundColor(new Color(241, 245, 249));
                c.setPadding(8f);
                table.addCell(c);
            }
            for (PetHealthReportResponse.AppointmentInfo a : data.getAppointments()) {
                addTableCell(table, a.getAppointmentDate().toString(), normalFont);
                addTableCell(table, a.getAppointmentTime(), normalFont);
                addTableCell(table, a.getVeterinarianName(), normalFont);
                addTableCell(table, a.getConsultationType(), normalFont);
            }
            document.add(table);
        }

        // --- 3. Medical History ---
        Paragraph medicalTitle = new Paragraph("Medical History", sectionFont);
        medicalTitle.setSpacingAfter(10f);
        document.add(medicalTitle);

        if (data.getMedicalHistory().isEmpty()) {
            document.add(new Paragraph("No medical records available.", normalFont));
        } else {
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setSpacingAfter(15f);
            String[] headers = {"Visit Date", "Doctor", "Diagnosis", "Treatment", "Follow-up"};
            for (String h : headers) {
                PdfPCell c = new PdfPCell(new Phrase(h, headerFont));
                c.setBackgroundColor(new Color(241, 245, 249));
                c.setPadding(8f);
                table.addCell(c);
            }
            for (PetHealthReportResponse.MedicalHistoryInfo mh : data.getMedicalHistory()) {
                addTableCell(table, mh.getVisitDate().toString(), normalFont);
                addTableCell(table, mh.getDoctorName(), normalFont);
                addTableCell(table, mh.getDiagnosis(), normalFont);
                addTableCell(table, mh.getTreatment(), normalFont);
                addTableCell(table, mh.getFollowUpDate() != null ? mh.getFollowUpDate().toString() : "-", normalFont);
            }
            document.add(table);
        }

        // --- 4. Vaccination History ---
        Paragraph vaccinationTitle = new Paragraph("Vaccination History", sectionFont);
        vaccinationTitle.setSpacingAfter(10f);
        document.add(vaccinationTitle);

        if (data.getVaccinations().isEmpty()) {
            document.add(new Paragraph("No vaccination records available.", normalFont));
        } else {
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setSpacingAfter(15f);
            String[] headers = {"Vaccine", "Dose", "Doctor", "Given Date", "Next Due", "Status"};
            for (String h : headers) {
                PdfPCell c = new PdfPCell(new Phrase(h, headerFont));
                c.setBackgroundColor(new Color(241, 245, 249));
                c.setPadding(8f);
                table.addCell(c);
            }
            for (PetHealthReportResponse.VaccinationInfo v : data.getVaccinations()) {
                addTableCell(table, v.getVaccineName(), normalFont);
                addTableCell(table, String.valueOf(v.getDoseNumber()), normalFont);
                addTableCell(table, v.getDoctorName(), normalFont);
                addTableCell(table, v.getGivenDate() != null ? v.getGivenDate().toString() : "-", normalFont);
                addTableCell(table, v.getNextDueDate() != null ? v.getNextDueDate().toString() : "-", normalFont);
                addTableCell(table, v.getStatus(), normalFont);
            }
            document.add(table);
        }

        // Footer
        Paragraph footer = new Paragraph("Generated by Pet Wellness System - Thank you for being a part of our family!", footerFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(30f);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }

    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setPadding(8f);
        table.addCell(cell);
    }
}
