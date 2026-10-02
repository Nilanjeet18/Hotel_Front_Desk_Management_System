package com.example.demo.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.service.ReportPdfService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportPdfService reportPdfService;

    @GetMapping("/booking-report")
    public ResponseEntity<byte[]> getBookingReport() throws Exception {

        byte[] pdf = reportPdfService.generateBookingReport(LocalDate.now());

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=BookingReport.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}