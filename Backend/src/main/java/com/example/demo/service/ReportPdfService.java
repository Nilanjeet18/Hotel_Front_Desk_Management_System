package com.example.demo.service;

import com.example.demo.model.Booking;
import com.example.demo.repository.BookingRepository;
import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReportPdfService {

    @Autowired
    private BookingRepository bookingRepository;

    // ── 1. Daily Revenue PDF ───────────────────────────────────────────────
    public String generateDailyRevenuePdf(Double revenue) {
        try {
            String filePath = "DailyRevenueReport.pdf";
            Document document = new Document();
            PdfWriter.getInstance(document, new FileOutputStream(filePath));
            document.open();
            document.add(new Paragraph("Daily Revenue Report"));
            document.add(new Paragraph("----------------------------"));
            
            document.add(new Paragraph("Total Revenue: Rs. " + revenue));
            document.close();
            return "PDF Generated: " + filePath;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error while generating PDF: " + e.getMessage();
        }
    }

    // ── 2. Booking Report as byte[] ────────────────────────────────────────
    public byte[] generateBookingReport(LocalDate date) throws Exception {

        
        List<Booking> bookings = bookingRepository.findByCheckIn(date);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, baos);
        document.open();

        document.add(new Paragraph("Booking Report - " + date));
        document.add(new Paragraph("---------------------------------------------------"));

        
        if (bookings == null || bookings.isEmpty()) {
            document.add(new Paragraph("No bookings found for date: " + date));
        } else {
            for (Booking b : bookings) {

               
                String bookingId    = String.valueOf(b.getBookingId());
                String customerName = (b.getCustomer() != null)
                                      ? b.getCustomer().getName() : "N/A";
                String roomNumber   = (b.getRoom() != null)
                                      ? String.valueOf(b.getRoom().getRoomNumber()) : "N/A";
                String amount       = (b.getTotalAmount() != null)
                                      ? b.getTotalAmount().toString() : "0.0";

                document.add(new Paragraph(
                        "Booking ID : " + bookingId +
                        " | Customer : " + customerName +
                        " | Room     : " + roomNumber +
                        " | Amount   : Rs. " + amount
                ));
            }
        }

        document.close();
        return baos.toByteArray();
    }
}