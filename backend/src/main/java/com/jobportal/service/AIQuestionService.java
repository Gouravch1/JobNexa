package com.jobportal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIQuestionService {

    private final RestTemplate restTemplate;

    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model:llama3}")
    private String ollamaModel;

    public List<String> generateQuestions(String jobDescription, String resumeText, int count) {
        log.info("=== GENERATING INTERVIEW QUESTIONS (Ollama / Llama) ===");
        log.info("Job description length: {}, Resume text length: {}, Count: {}",
                jobDescription.length(), resumeText.length(), count);
        log.info("Resume preview: {}", resumeText.isEmpty() ? "[EMPTY - no resume]"
                : resumeText.substring(0, Math.min(200, resumeText.length())));

        try {
            String url = ollamaBaseUrl + "/api/chat";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String prompt = String.format(
                    "You are a technical interviewer conducting a voice-based job interview.\n\n" +
                    "You have:\n" +
                    "- JOB DESCRIPTION: the role and required skills.\n" +
                    "- CANDIDATE RESUME: their projects, skills, and experience.\n\n" +
                    "Generate exactly %d interview questions at EASY difficulty level.\n\n" +
                    "EASY LEVEL means:\n" +
                    "  - Ask basic concept definitions (e.g. 'What is a REST API?', 'What is a primary key in a database?').\n" +
                    "  - Ask about tools/languages they listed in their resume (e.g. 'You have used React — what is state in React?').\n" +
                    "  - Ask about their projects in simple terms (e.g. 'Tell me what you built in your project and how it works.').\n" +
                    "STRICT RULES — DO NOT BREAK THESE:\n" +
                    "  - NO system design questions.\n" +
                    "  - NO microservices, distributed systems, or scalability questions.\n" +
                    "  - NO architecture design questions.\n" +
                    "  - NO questions about production incidents, SRE, or DevOps practices.\n" +
                    "  - NO competitive programming or algorithmic complexity analysis.\n" +
                    "  - Keep every question SHORT — max 2 sentences.\n" +
                    "  - Questions must sound natural when spoken aloud.\n\n" +
                    "Question mix (5 total):\n" +
                    "  Q1: Basic technical concept from the job description skills.\n" +
                    "  Q2: Another basic technical concept from the job description skills.\n" +
                    "  Q3: Question about a specific project from the resume — ask what they built and how.\n" +
                    "  Q4: Simple practical question — e.g. how they would fix a basic bug or use a tool.\n" +
                    "  Q5: Basic core programming language concept question with real life example\n\n" +
                    "JOB DESCRIPTION:\n%s\n\n" +
                    "CANDIDATE RESUME:\n%s\n\n" +
                    "Output ONLY the %d questions, one per line, numbered 1 to %d.\n" +
                    "No explanations. No answers. No extra text.",
                    count,
                    jobDescription,
                    resumeText.isEmpty() ? "No resume provided"
                            : resumeText.substring(0, Math.min(resumeText.length(), 2000)),
                    count,
                    count);

            Map<String, Object> systemMessage = Map.of(
                    "role", "system",
                    "content", "You are a technical interviewer who only asks easy, basic-level questions. You never ask hard, complex, or senior-level questions. Every question must be simple enough for a fresher to understand.");

            Map<String, Object> userMessage = Map.of(
                    "role", "user",
                    "content", prompt);

            Map<String, Object> requestBody = Map.of(
                    "model", ollamaModel,
                    "messages", List.of(systemMessage, userMessage),
                    "stream", false,
                    "temperature", 0.5);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();

                Map<String, Object> messageResp = (Map<String, Object>) body.get("message");
                if (messageResp != null) {
                    String text = (String) messageResp.get("content");
                    log.info("Ollama raw response: {}", text);
                    List<String> questions = parseQuestions(text != null ? text : "", count);
                    if (questions.size() >= count) {
                        log.info("Ollama generated {} questions successfully", questions.size());
                        return questions;
                    }
                }
                log.warn("Ollama response has no valid content. Keys: {}", body.keySet());
            } else {
                log.error("Ollama returned status: {}, body: {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("Ollama/Llama question generation FAILED: {}", e.getMessage(), e);
        }

        log.warn("!!! USING FALLBACK QUESTIONS - Ollama/Llama generation failed !!!");
        return generateFallbackQuestions(count);
    }

    private List<String> parseQuestions(String content, int count) {
        List<String> questions = new ArrayList<>();
        if (content == null || content.trim().isEmpty()) {
            return questions;
        }

        // Pass 1: line-based parsing (ideal case: one question per line, numbered)
        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            String cleaned = line.replaceAll("^\\d+[.)]\\s*", "").trim();
            if (!cleaned.isEmpty() && cleaned.length() > 10) {
                questions.add(cleaned);
            }
            if (questions.size() >= count) {
                return questions;
            }
        }

        // Pass 2: fallback – split by question marks if the model returned everything in one line
        if (questions.size() < count) {
            String[] parts = content.split("\\?");
            for (String part : parts) {
                String candidate = part.trim();
                if (candidate.length() > 10) {
                    String withQuestionMark = candidate.endsWith("?") ? candidate : candidate + "?";
                    if (!questions.contains(withQuestionMark)) {
                        questions.add(withQuestionMark);
                    }
                }
                if (questions.size() >= count) {
                    break;
                }
            }
        }

        return questions;
    }

    private List<String> generateFallbackQuestions(int count) {
        List<String> fallback = new ArrayList<>(List.of(
                "Tell me about yourself and your professional background.",
                "What are your key technical skills and how have you applied them in your previous roles?",
                "Describe a challenging project you worked on. What was your role and how did you overcome obstacles?",
                "How do you stay updated with the latest technologies and industry trends?",
                "Where do you see yourself in five years and how does this role fit into your career goals?",
                "Can you describe a situation where you had to work with a difficult team member? How did you handle it?"));
        return fallback.subList(0, Math.min(count, fallback.size()));
    }
}
