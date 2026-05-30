package com.jobportal.service;

import com.jobportal.dto.*;
import com.jobportal.entity.*;
import com.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final AIQuestionService aiQuestionService;
    private final AIEvaluationService aiEvaluationService;
    private final ElevenLabsService elevenLabsService;
    private final ResumeParserService resumeParserService;

    private static final int TOTAL_QUESTIONS = 5;

    /**
     * Start an interview for the given application.
     * Generates questions and saves them.
     */
    public InterviewStartResponse startInterview(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Check if resume score >= 50
        if (application.getResumeScore() == null || application.getResumeScore() < 50) {
            throw new RuntimeException("Resume score must be at least 50% to start an interview. Current score: " +
                    (application.getResumeScore() != null ? application.getResumeScore() : 0) + "%");
        }

        // Check if interview already exists
        long existingQuestions = interviewRepository.countByApplicationId(applicationId);
        if (existingQuestions > 0) {
            throw new RuntimeException("Interview has already been started for this application");
        }

        // Update application status
        application.setStatus(ApplicationStatus.INTERVIEW);
        applicationRepository.save(application);

        // Generate questions - read resume text
        String resumeText = "";
        try {
            if (application.getResumeUrl() != null) {
                String resumeUrl = application.getResumeUrl();
                log.info("Attempting to read resume from URL: {}", resumeUrl);

                // Try multiple path resolutions
                java.nio.file.Path resumePath = java.nio.file.Paths.get("." + resumeUrl);
                if (!java.nio.file.Files.exists(resumePath)) {
                    // Try without leading dot
                    resumePath = java.nio.file.Paths
                            .get(resumeUrl.startsWith("/") ? resumeUrl.substring(1) : resumeUrl);
                }
                if (!java.nio.file.Files.exists(resumePath)) {
                    // Try absolute from upload dir
                    resumePath = java.nio.file.Paths.get("uploads", "resumes",
                            resumeUrl.substring(resumeUrl.lastIndexOf("/") + 1));
                }

                log.info("Resolved resume path: {} (exists: {})", resumePath.toAbsolutePath(),
                        java.nio.file.Files.exists(resumePath));

                if (java.nio.file.Files.exists(resumePath)) {
                    byte[] pdfBytes = java.nio.file.Files.readAllBytes(resumePath);
                    resumeText = resumeParserService.extractTextFromPdf(pdfBytes);
                    log.info("Extracted resume text length: {}", resumeText.length());
                } else {
                    log.warn("Resume file not found at any attempted path for URL: {}", resumeUrl);
                }
            } else {
                log.warn("Application has no resume URL set");
            }
        } catch (Exception e) {
            log.error("Could not read resume for question generation: {}", e.getMessage(), e);
        }

        String jobDescription = application.getJob().getDescription() + "\nSkills: " + application.getJob().getSkills();
        List<String> questions = aiQuestionService.generateQuestions(jobDescription, resumeText, TOTAL_QUESTIONS);

        // Save questions
        for (int i = 0; i < questions.size(); i++) {
            Interview interview = Interview.builder()
                    .application(application)
                    .question(questions.get(i))
                    .questionOrder(i + 1)
                    .build();
            interviewRepository.save(interview);
        }

        return InterviewStartResponse.builder()
                .applicationId(applicationId)
                .totalQuestions(questions.size())
                .message("Interview started successfully. " + questions.size() + " questions generated.")
                .build();
    }

    /**
     * Get the next unanswered question for the application.
     * Includes TTS audio if Sarvam AI is configured.
     */
    public InterviewQuestionResponse getNextQuestion(Long applicationId) {
        List<Interview> interviews = interviewRepository.findByApplicationIdOrderByQuestionOrderAsc(applicationId);

        if (interviews.isEmpty()) {
            throw new RuntimeException("Interview has not been started yet");
        }

        // Find first unanswered question
        Interview nextQuestion = interviews.stream()
                .filter(i -> i.getAnswer() == null || i.getAnswer().isEmpty())
                .findFirst()
                .orElse(null);

        if (nextQuestion == null) {
            throw new RuntimeException("All questions have been answered. Please submit the interview.");
        }

        // Generate TTS audio
        String audioBase64 = elevenLabsService.textToSpeech(nextQuestion.getQuestion());

        return InterviewQuestionResponse.builder()
                .interviewId(nextQuestion.getId())
                .questionNumber(nextQuestion.getQuestionOrder())
                .totalQuestions(interviews.size())
                .questionText(nextQuestion.getQuestion())
                .audioUrl(audioBase64)
                .isLastQuestion(nextQuestion.getQuestionOrder() == interviews.size())
                .build();
    }

    /**
     * Save an answer for a specific question.
     * Accepts base64 audio and/or text answer (from Web Speech API fallback).
     */
    public Map<String, Object> saveAnswer(Long applicationId, int questionNumber, String audioBase64,
            String textAnswer, String audioFormat) {
        log.info("=== SAVING ANSWER for Q{} (app: {}) ===", questionNumber, applicationId);
        log.info("Audio base64 length: {}, Text answer: '{}', Format: {}",
                audioBase64 != null ? audioBase64.length() : 0,
                textAnswer != null ? textAnswer.substring(0, Math.min(100, textAnswer.length())) : "null",
                audioFormat);

        Interview interview = interviewRepository.findByApplicationIdAndQuestionOrder(applicationId, questionNumber)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        String answer = null;

        // Try 1: Convert audio to text using ElevenLabs STT
        if (audioBase64 != null && !audioBase64.isEmpty()) {
            try {
                String transcribed = elevenLabsService.speechToText(audioBase64, audioFormat);
                if (transcribed != null && !transcribed.trim().isEmpty()) {
                    answer = transcribed.trim();
                    log.info("Using STT transcription: '{}'", answer);
                }
            } catch (Exception e) {
                log.warn("STT failed: {}", e.getMessage());
            }
        }

        // Try 2: Use text answer from frontend Web Speech API
        if ((answer == null || answer.isEmpty()) && textAnswer != null && !textAnswer.trim().isEmpty()) {
            answer = textAnswer.trim();
            log.info("Using frontend Web Speech API text: '{}'", answer);
        }

        // Try 3: Default
        if (answer == null || answer.trim().isEmpty()) {
            answer = "No answer provided";
            log.warn("No answer captured for Q{}", questionNumber);
        }

        interview.setAnswer(answer);
        interviewRepository.save(interview);
        log.info("Answer saved for Q{}: '{}'", questionNumber, answer.substring(0, Math.min(80, answer.length())));

        Map<String, Object> response = new HashMap<>();
        response.put("questionNumber", questionNumber);
        response.put("answer", answer);
        response.put("message", "Answer saved successfully");
        return response;
    }

    /**
     * Submit the interview for evaluation.
     * Evaluates all answers and generates overall score and feedback.
     */
    public InterviewResultResponse submitInterview(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        List<Interview> interviews = interviewRepository.findByApplicationIdOrderByQuestionOrderAsc(applicationId);

        if (interviews.isEmpty()) {
            throw new RuntimeException("No interview found for this application");
        }

        // Evaluate each answer
        double totalScore = 0;
        List<InterviewResultResponse.QuestionResult> results = new ArrayList<>();
        List<String> questions = new ArrayList<>();
        List<String> answers = new ArrayList<>();

        for (Interview interview : interviews) {
            double score = 0;
            if (interview.getAnswer() != null && !interview.getAnswer().equals("No answer provided")) {
                score = aiEvaluationService.evaluateAnswer(interview.getQuestion(), interview.getAnswer());
            }

            interview.setScore(score);
            interviewRepository.save(interview);
            totalScore += score;

            questions.add(interview.getQuestion());
            answers.add(interview.getAnswer());

            results.add(InterviewResultResponse.QuestionResult.builder()
                    .questionNumber(interview.getQuestionOrder())
                    .question(interview.getQuestion())
                    .answer(interview.getAnswer() != null ? interview.getAnswer() : "No answer provided")
                    .score(score)
                    .build());
        }

        double overallScore = totalScore / interviews.size();

        // Generate feedback
        String feedback = aiEvaluationService.generateFeedback(questions, answers, overallScore);

        // Update application
        application.setInterviewScore(overallScore);
        application.setFeedback(feedback);
        applicationRepository.save(application);

        return InterviewResultResponse.builder()
                .applicationId(applicationId)
                .overallScore(Math.round(overallScore * 100.0) / 100.0)
                .feedback(feedback)
                .questions(results)
                .build();
    }

    /**
     * Get interview results for an application.
     */
    public InterviewResultResponse getResult(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        List<Interview> interviews = interviewRepository.findByApplicationIdOrderByQuestionOrderAsc(applicationId);

        List<InterviewResultResponse.QuestionResult> results = interviews.stream()
                .map(i -> InterviewResultResponse.QuestionResult.builder()
                        .questionNumber(i.getQuestionOrder())
                        .question(i.getQuestion())
                        .answer(i.getAnswer() != null ? i.getAnswer() : "No answer provided")
                        .score(i.getScore() != null ? i.getScore() : 0.0)
                        .build())
                .collect(Collectors.toList());

        return InterviewResultResponse.builder()
                .applicationId(applicationId)
                .overallScore(application.getInterviewScore() != null ? application.getInterviewScore() : 0.0)
                .feedback(
                        application.getFeedback() != null ? application.getFeedback() : "Interview not yet evaluated.")
                .questions(results)
                .build();
    }
}
