package com.jobportal.controller;

import com.jobportal.dto.ApplicationResponse;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    @PostMapping("/apply")
    public ResponseEntity<ApplicationResponse> apply(
            @RequestParam("jobId") Long jobId,
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(applicationService.applyForJob(user.getId(), jobId, resume));
    }

    @GetMapping("/user")
    public ResponseEntity<List<ApplicationResponse>> getUserApplications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(applicationService.getUserApplications(user.getId()));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ApplicationResponse>> getJobApplications(
            @PathVariable Long jobId,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(applicationService.getJobApplicationsForAdmin(user.getId(), jobId));
    }
}
