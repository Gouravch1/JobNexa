package com.jobportal.service;

import com.jobportal.dto.InterviewQuestionResponse;
import com.jobportal.dto.InterviewResultResponse;
import com.jobportal.dto.InterviewStartResponse;
import com.jobportal.dto.MockTestStartResponse;
import com.jobportal.entity.MockInterviewQuestion;
import com.jobportal.entity.MockInterviewSession;
import com.jobportal.repository.MockInterviewQuestionRepository;
import com.jobportal.repository.MockInterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MockInterviewService {

    private final MockTestService mockTestService;
    private final MockInterviewSessionRepository sessionRepository;
    private final MockInterviewQuestionRepository questionRepository;
    private final AIEvaluationService aiEvaluationService;
    private final ElevenLabsService elevenLabsService;

    public InterviewStartResponse startMockInterview(String testId) {
        MockTestStartResponse randomTest = mockTestService.startRandomMockTest(testId);

        MockInterviewSession session = MockInterviewSession.builder()
                .testId(randomTest.getTestId())
                .testName(randomTest.getTestName())
                .submitted(false)
                .build();
        session = sessionRepository.save(session);

        for (int i = 0; i < randomTest.getQuestions().size(); i++) {
            MockInterviewQuestion q = MockInterviewQuestion.builder()
                    .session(session)
                    .question(randomTest.getQuestions().get(i))
                    .questionOrder(i + 1)
                    .build();
            questionRepository.save(q);
        }

        return InterviewStartResponse.builder()
                .applicationId(session.getId())
                .totalQuestions(randomTest.getTotalQuestions())
                .message("Mock interview started successfully.")
                .build();
    }

    public InterviewQuestionResponse getNextQuestion(Long sessionId) {
        List<MockInterviewQuestion> questions = questionRepository.findBySessionIdOrderByQuestionOrderAsc(sessionId);
        if (questions.isEmpty()) {
            throw new RuntimeException("Mock interview not found.");
        }

        MockInterviewQuestion next = questions.stream()
                .filter(q -> q.getAnswer() == null || q.getAnswer().isEmpty())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("All questions answered. Please submit."));

        String audio = elevenLabsService.textToSpeech(next.getQuestion());

        return InterviewQuestionResponse.builder()
                .interviewId(next.getId())
                .questionNumber(next.getQuestionOrder())
                .totalQuestions(questions.size())
                .questionText(next.getQuestion())
                .audioUrl(audio)
                .isLastQuestion(next.getQuestionOrder() == questions.size())
                .build();
    }

    public Map<String, Object> saveAnswer(Long sessionId, int questionNumber, String audioBase64,
                                          String textAnswer, String audioFormat) {
        MockInterviewQuestion question = questionRepository.findBySessionIdAndQuestionOrder(sessionId, questionNumber)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        String answer = null;
        if (audioBase64 != null && !audioBase64.isEmpty()) {
            try {
                String transcribed = elevenLabsService.speechToText(audioBase64, audioFormat);
                if (transcribed != null && !transcribed.trim().isEmpty()) {
                    answer = transcribed.trim();
                }
            } catch (Exception ignored) {
            }
        }
        if ((answer == null || answer.isBlank()) && textAnswer != null && !textAnswer.trim().isEmpty()) {
            answer = textAnswer.trim();
        }
        if (answer == null || answer.isBlank()) {
            answer = "No answer provided";
        }

        question.setAnswer(answer);
        questionRepository.save(question);

        Map<String, Object> response = new HashMap<>();
        response.put("questionNumber", questionNumber);
        response.put("answer", answer);
        response.put("message", "Answer saved successfully");
        return response;
    }

    public InterviewResultResponse submitInterview(Long sessionId) {
        MockInterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Mock interview session not found"));
        List<MockInterviewQuestion> questions = questionRepository.findBySessionIdOrderByQuestionOrderAsc(sessionId);
        if (questions.isEmpty()) {
            throw new RuntimeException("No questions found for this mock interview.");
        }

        double totalScore = 0;
        List<String> questionTexts = new ArrayList<>();
        List<String> answers = new ArrayList<>();
        List<InterviewResultResponse.QuestionResult> results = new ArrayList<>();

        for (MockInterviewQuestion q : questions) {
            double score = 0;
            if (q.getAnswer() != null && !q.getAnswer().equals("No answer provided")) {
                score = aiEvaluationService.evaluateAnswer(q.getQuestion(), q.getAnswer());
            }
            q.setScore(score);
            questionRepository.save(q);
            totalScore += score;

            questionTexts.add(q.getQuestion());
            answers.add(q.getAnswer());

            results.add(InterviewResultResponse.QuestionResult.builder()
                    .questionNumber(q.getQuestionOrder())
                    .question(q.getQuestion())
                    .answer(q.getAnswer() != null ? q.getAnswer() : "No answer provided")
                    .score(score)
                    .build());
        }

        double overall = totalScore / questions.size();
        String feedback = aiEvaluationService.generateFeedback(questionTexts, answers, overall);

        session.setOverallScore(overall);
        session.setFeedback(feedback);
        session.setSubmitted(true);
        sessionRepository.save(session);

        return InterviewResultResponse.builder()
                .applicationId(sessionId)
                .overallScore(Math.round(overall * 100.0) / 100.0)
                .feedback(feedback)
                .questions(results)
                .build();
    }

    public InterviewResultResponse getResult(Long sessionId) {
        MockInterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Mock interview session not found"));
        List<MockInterviewQuestion> questions = questionRepository.findBySessionIdOrderByQuestionOrderAsc(sessionId);

        List<InterviewResultResponse.QuestionResult> resultQuestions = questions.stream()
                .map(q -> InterviewResultResponse.QuestionResult.builder()
                        .questionNumber(q.getQuestionOrder())
                        .question(q.getQuestion())
                        .answer(q.getAnswer() != null ? q.getAnswer() : "No answer provided")
                        .score(q.getScore() != null ? q.getScore() : 0.0)
                        .build())
                .collect(Collectors.toList());

        return InterviewResultResponse.builder()
                .applicationId(sessionId)
                .overallScore(session.getOverallScore() != null ? session.getOverallScore() : 0.0)
                .feedback(session.getFeedback() != null ? session.getFeedback() : "Mock interview not yet evaluated.")
                .questions(resultQuestions)
                .build();
    }
}
