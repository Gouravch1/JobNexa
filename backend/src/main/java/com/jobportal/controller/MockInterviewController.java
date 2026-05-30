package com.jobportal.controller;

import com.jobportal.dto.InterviewQuestionResponse;
import com.jobportal.dto.InterviewResultResponse;
import com.jobportal.dto.InterviewStartResponse;
import com.jobportal.dto.MockTestStartRequest;
import com.jobportal.service.MockInterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mock-interview")
@RequiredArgsConstructor
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;

    @PostMapping("/start")
    public ResponseEntity<InterviewStartResponse> start(@Valid @RequestBody MockTestStartRequest request) {
        return ResponseEntity.ok(mockInterviewService.startMockInterview(request.getTestId()));
    }

    @GetMapping("/question/{sessionId}")
    public ResponseEntity<InterviewQuestionResponse> getQuestion(@PathVariable Long sessionId) {
        return ResponseEntity.ok(mockInterviewService.getNextQuestion(sessionId));
    }

    @PostMapping("/answer/{sessionId}")
    public ResponseEntity<Map<String, Object>> submitAnswer(
            @PathVariable Long sessionId,
            @RequestBody Map<String, Object> request) {
        int questionNumber = (int) request.get("questionNumber");
        String audioBase64 = (String) request.getOrDefault("audio", null);
        String textAnswer = (String) request.getOrDefault("textAnswer", null);
        String audioFormat = (String) request.getOrDefault("audioFormat", "webm");

        return ResponseEntity.ok(
                mockInterviewService.saveAnswer(sessionId, questionNumber, audioBase64, textAnswer, audioFormat));
    }

    @PostMapping("/submit/{sessionId}")
    public ResponseEntity<InterviewResultResponse> submit(@PathVariable Long sessionId) {
        return ResponseEntity.ok(mockInterviewService.submitInterview(sessionId));
    }

    @GetMapping("/result/{sessionId}")
    public ResponseEntity<InterviewResultResponse> result(@PathVariable Long sessionId) {
        return ResponseEntity.ok(mockInterviewService.getResult(sessionId));
    }
}
