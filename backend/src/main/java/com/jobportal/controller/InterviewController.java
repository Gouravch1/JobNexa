package com.jobportal.controller;

import com.jobportal.dto.*;
import com.jobportal.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/start/{applicationId}")
    public ResponseEntity<InterviewStartResponse> startInterview(@PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewService.startInterview(applicationId));
    }

    @GetMapping("/question/{applicationId}")
    public ResponseEntity<InterviewQuestionResponse> getQuestion(@PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewService.getNextQuestion(applicationId));
    }

    @PostMapping("/answer/{applicationId}")
    public ResponseEntity<Map<String, Object>> submitAnswer(
            @PathVariable Long applicationId,
            @RequestBody Map<String, Object> request) {

        int questionNumber = (int) request.get("questionNumber");
        String audioBase64 = (String) request.getOrDefault("audio", null);
        String textAnswer = (String) request.getOrDefault("textAnswer", null);
        String audioFormat = (String) request.getOrDefault("audioFormat", "webm");

        return ResponseEntity.ok(interviewService.saveAnswer(applicationId, questionNumber, audioBase64, textAnswer, audioFormat));
    }

    @PostMapping("/submit/{applicationId}")
    public ResponseEntity<InterviewResultResponse> submitInterview(@PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewService.submitInterview(applicationId));
    }

    @GetMapping("/result/{applicationId}")
    public ResponseEntity<InterviewResultResponse> getResult(@PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewService.getResult(applicationId));
    }
}
