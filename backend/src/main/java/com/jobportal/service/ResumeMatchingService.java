package com.jobportal.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeMatchingService {

    private static final Set<String> STOP_WORDS = Set.of(
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "by", "is", "are", "was", "were", "be", "been", "being",
            "have", "has", "had", "do", "does", "did", "will", "would", "could",
            "should", "may", "might", "shall", "can", "need", "must", "this", "that",
            "these", "those", "i", "you", "he", "she", "it", "we", "they", "me",
            "him", "her", "us", "them", "my", "your", "his", "its", "our", "their",
            "not", "no", "nor", "as", "if", "then", "else", "when", "up", "out",
            "so", "than", "too", "very", "just", "about", "above", "after", "before");

    public double calculateMatchScore(String resumeText, String jobDescription) {
        if (resumeText == null || jobDescription == null) {
            return 0.0;
        }

        Set<String> jobKeywords = extractKeywords(jobDescription.toLowerCase());
        Set<String> resumeKeywords = extractKeywords(resumeText.toLowerCase());

        if (jobKeywords.isEmpty()) {
            return 0.0;
        }

        long matchCount = jobKeywords.stream()
                .filter(keyword -> resumeKeywords.stream()
                        .anyMatch(rk -> rk.contains(keyword) || keyword.contains(rk)))
                .count();

        double score = ((double) matchCount / jobKeywords.size()) * 100;
        return Math.min(Math.round(score * 100.0) / 100.0, 100.0);
    }

    private Set<String> extractKeywords(String text) {
        return Arrays.stream(text.replaceAll("[^a-zA-Z0-9\\s+#.]", " ").split("\\s+"))
                .map(String::trim)
                .filter(word -> word.length() > 2)
                .filter(word -> !STOP_WORDS.contains(word))
                .collect(Collectors.toSet());
    }
}
