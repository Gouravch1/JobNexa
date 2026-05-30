package com.jobportal.controller;

import com.jobportal.dto.MockTestInfoResponse;
import com.jobportal.dto.MockTestStartRequest;
import com.jobportal.dto.MockTestStartResponse;
import com.jobportal.dto.MockTestTrackResponse;
import com.jobportal.service.MockTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mock-tests")
@RequiredArgsConstructor
public class MockTestController {

    private final MockTestService mockTestService;

    @GetMapping("/tracks")
    public ResponseEntity<List<MockTestTrackResponse>> getTracks() {
        return ResponseEntity.ok(mockTestService.getTracks());
    }

    @GetMapping("/tests")
    public ResponseEntity<List<MockTestInfoResponse>> getAllTests() {
        return ResponseEntity.ok(mockTestService.getAllTests());
    }

    @GetMapping("/tests/{trackId}")
    public ResponseEntity<List<MockTestInfoResponse>> getTestsByTrack(@PathVariable String trackId) {
        return ResponseEntity.ok(mockTestService.getTestsByTrack(trackId));
    }

    @PostMapping("/start")
    public ResponseEntity<MockTestStartResponse> startMockTest(@Valid @RequestBody MockTestStartRequest request) {
        return ResponseEntity.ok(mockTestService.startRandomMockTest(request.getTestId()));
    }
}
