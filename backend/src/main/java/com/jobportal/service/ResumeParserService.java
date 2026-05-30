package com.jobportal.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ResumeParserService {

    public String extractTextFromPdf(MultipartFile file) {
        try {
            PDDocument document = Loader.loadPDF(file.getBytes());
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();
            return text.toLowerCase().trim();
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse PDF resume: " + e.getMessage());
        }
    }

    public String extractTextFromPdf(byte[] pdfBytes) {
        try {
            PDDocument document = Loader.loadPDF(pdfBytes);
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();
            return text.toLowerCase().trim();
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse PDF resume: " + e.getMessage());
        }
    }
}
