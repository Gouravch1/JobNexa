package com.jobportal.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIEvaluationService {

    private final RestTemplate restTemplate;

    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model:llama3.2:1b}")
    private String ollamaModel;

    private static final Set<String> STOP_WORDS = Set.of(
            "the", "is", "am", "are", "a", "an", "of", "and", "or", "to", "in", "on", "for", "with", "at", "by",
            "this", "that", "it", "as", "be", "from", "about", "into", "over", "after", "than", "then", "so", "such",
            "very", "just", "also", "but", "if", "else", "when", "while", "because"
    );

    private static final Pattern TOKEN_SPLIT = Pattern.compile("[^a-z0-9]+");

    public double evaluateAnswer(String question, String answer) {
        if (answer == null || answer.trim().isEmpty()) {
            return 0.0;
        }

        String trimmed = answer.trim();
        int words = trimmed.split("\\s+").length;

        // Hard guardrail: too short or meaningless answers
        if (trimmed.length() < 8 || words < 2) {
            return 0.0;
        }
        if (trimmed.equalsIgnoreCase("No answer provided") || trimmed.equalsIgnoreCase("i don't know")) {
            return 0.0;
        }

        try {
            String url = ollamaBaseUrl + "/api/chat";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Strict rubric-based prompt — AI gives marks based on correctness, not length
            String prompt = String.format(
                    "You are a STRICT interview evaluator. Score the candidate's answer honestly and strictly.\n\n" +
                    "QUESTION: %s\n\n" +
                    "CANDIDATE ANSWER: %s\n\n" +
                    "Scoring rubric (be strict — do not be lenient):\n" +
                    "  0   = No answer, completely wrong, irrelevant, or just 'I don't know'.\n" +
                    "  20  = Heard of the topic but cannot explain it at all. Very vague.\n" +
                    "  40  = Mentions some correct points but has major gaps or misconceptions.\n" +
                    "  60  = Understands the concept partially. Correct but incomplete explanation.\n" +
                    "  80  = Good answer. Correct explanation with minor missing details.\n" +
                    "  100 = Perfect. Fully correct, clear, specific, and well-explained.\n\n" +
                    "Rules:\n" +
                    "  - If the answer is vague or just restates the question → max 20.\n" +
                    "  - If the answer has key facts wrong → max 40.\n" +
                    "  - Do NOT give high marks for long but incorrect answers.\n" +
                    "  - Do NOT give high marks just because the candidate seems confident.\n" +
                    "  - Reply with ONLY a single integer from this list: 0, 20, 40, 60, 80, 100. Nothing else.",
                    question, answer);

            Map<String, Object> systemMessage = Map.of(
                    "role", "system",
                    "content", "You are a strict interview evaluator. You only reply with a single integer score. You are not lenient. You give marks only based on correctness and completeness of the answer.");

            Map<String, Object> userMessage = Map.of(
                    "role", "user",
                    "content", prompt);

            Map<String, Object> requestBody = Map.of(
                    "model", ollamaModel,
                    "messages", List.of(systemMessage, userMessage),
                    "stream", false,
                    "temperature", 0.0);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Map<String, Object> messageResp = (Map<String, Object>) body.get("message");
                if (messageResp != null) {
                    String text = (String) messageResp.get("content");
                    if (text != null && !text.trim().isEmpty()) {
                        // Extract first number found in the response
                        String numeric = text.trim().replaceAll("[^0-9]", "");
                        if (!numeric.isEmpty()) {
                            double score = Double.parseDouble(numeric.substring(0, Math.min(3, numeric.length())));
                            score = Math.max(0, Math.min(100, score));
                            log.info("Ollama scored answer: {}/100 (raw response: '{}')", score, text.trim());
                            return score;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Ollama/Llama evaluation failed: {}", e.getMessage());
        }

        // Fallback: consistent rubric without Ollama
        return calculateFallbackScore(question, answer);
    }

    public String generateFeedback(List<String> questions, List<String> answers, double overallScore) {
        try {
            String url = ollamaBaseUrl + "/api/chat";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            StringBuilder qa = new StringBuilder();
            for (int i = 0; i < questions.size(); i++) {
                qa.append(String.format("Q%d: %s\n", i + 1, questions.get(i)));
                String ans = (i < answers.size() && answers.get(i) != null) ? answers.get(i) : "No answer provided";
                qa.append(String.format("A%d: %s\n\n", i + 1, ans));
            }

            String prompt = String.format(
                    "You are an interview evaluator.\n\n" +
                            "The candidate scored %.1f out of 100 overall based on an AI evaluation of their answers.\n\n" +
                            "Below are the questions and the candidate's answers.\n" +
                            "Provide constructive feedback in 3–4 sentences, covering:\n" +
                            "- Key strengths observed from the answers,\n" +
                            "- The main areas where the candidate should improve,\n" +
                            "- How well they fit the role overall.\n\n" +
                            "Be specific but concise and keep the tone professional and encouraging.\n\n" +
                            "%s",
                    overallScore, qa);

            Map<String, Object> systemMessage = Map.of(
                    "role", "system",
                    "content",
                    "You are an experienced technical interviewer. You write short, concrete, and encouraging feedback based only on the provided questions and answers.");

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
                    if (text != null && !text.trim().isEmpty()) {
                        return text.trim();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Ollama/Llama feedback generation failed: {}", e.getMessage());
        }

        return getFallbackFeedback(overallScore);
    }

    private String getFallbackFeedback(double overallScore) {
        if (overallScore >= 80) {
            return "Excellent performance! Your answers demonstrated strong knowledge and communication skills. Keep up the great work.";
        } else if (overallScore >= 60) {
            return "Good performance overall. Your answers showed adequate understanding, but there's room for improvement in providing more detailed and specific examples.";
        } else if (overallScore >= 40) {
            return "Your performance was below average. Consider preparing more thoroughly by researching common interview questions and practicing your responses with specific examples.";
        } else {
            return "Your performance needs significant improvement. Focus on understanding the job requirements better and practice articulating your skills and experiences more clearly.";
        }
    }

    private double calculateFallbackScore(String question, String answer) {
        String trimmed = answer.trim();
        int words = trimmed.split("\\s+").length;

        if (trimmed.length() < 8 || words < 2) return 0.0;

        // Strict fallback: requires both length AND keyword alignment to score higher
        double alignment = computeSemanticAlignment(question, answer);

        double base;
        if      (words >= 60 && alignment >= 0.5)  base = 80.0;  // detailed + highly relevant
        else if (words >= 40 && alignment >= 0.35)  base = 60.0;  // decent + relevant
        else if (words >= 20 && alignment >= 0.2)   base = 40.0;  // some content, some relevance
        else if (words >= 8  && alignment >= 0.1)   base = 20.0;  // very vague
        else                                         base = 0.0;   // irrelevant

        log.info("Fallback score: {} (words={}, alignment={})", base, words, alignment);
        return base;
    }

    /**
     * Very lightweight semantic check:
     * - Tokenize question and answer
     * - Remove stopwords
     * - Compute overlap ratio between important words in question and answer
     */
    private double computeSemanticAlignment(String question, String answer) {
        if (question == null || answer == null) {
            return 0.0;
        }

        Set<String> qTokens = tokenize(question);
        Set<String> aTokens = tokenize(answer);

        if (qTokens.isEmpty() || aTokens.isEmpty()) {
            return 0.0;
        }

        long overlap = qTokens.stream().filter(aTokens::contains).count();
        return (double) overlap / (double) qTokens.size();
    }

    private Set<String> tokenize(String text) {
        return TOKEN_SPLIT.splitAsStream(text.toLowerCase())
                .filter(t -> !t.isBlank())
                .filter(t -> !STOP_WORDS.contains(t))
                .collect(Collectors.toSet());
    }
}
