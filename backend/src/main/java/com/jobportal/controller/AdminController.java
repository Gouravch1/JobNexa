package com.jobportal.controller;

import com.jobportal.dto.ApplicationResponse;
import com.jobportal.dto.CandidateProfileResponse;
import com.jobportal.repository.*;
import com.jobportal.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationResponse>> getAllApplications(Authentication authentication) {
        var admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(applicationService.getApplicationsForAdmin(admin.getId()));
    }

    @GetMapping("/applications/{id}/candidate-profile")
    public ResponseEntity<CandidateProfileResponse> getCandidateProfile(
            @PathVariable Long id,
            Authentication authentication) {
        var admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(applicationService.getCandidateProfileForAdmin(admin.getId(), id));
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String status = request.get("status");
        var admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(applicationService.updateStatusForAdmin(admin.getId(), id, status));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication authentication) {
        var admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalJobs", jobRepository.countByCreatedBy(admin.getId()));
        stats.put("totalApplications", applicationRepository.countByJobCreatedBy(admin.getId()));
        return ResponseEntity.ok(stats);
    }
}
