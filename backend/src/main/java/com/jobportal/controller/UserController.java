package com.jobportal.controller;

import com.jobportal.dto.UpdateProfileRequest;
import com.jobportal.dto.UpdateUserSettingsRequest;
import com.jobportal.dto.UserProfileResponse;
import com.jobportal.dto.UserSettingsResponse;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }

    @GetMapping("/me/settings")
    public ResponseEntity<UserSettingsResponse> getSettings(Authentication authentication) {
        return ResponseEntity.ok(userService.getSettings(authentication.getName()));
    }

    @PutMapping("/me/settings")
    public ResponseEntity<UserSettingsResponse> updateSettings(
            @RequestBody UpdateUserSettingsRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateSettings(authentication.getName(), request));
    }

    @PostMapping("/me/resume")
    public ResponseEntity<UserProfileResponse> uploadResume(
            @RequestParam("resume") MultipartFile resume,
            Authentication authentication) {
        if (resume == null || resume.isEmpty()) {
            throw new RuntimeException("Resume file is required");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String resumeUrl = saveUserResume(resume, user.getId());
        user.setResumeUrl(resumeUrl);
        userRepository.save(user);

        return ResponseEntity.ok(userService.mapToProfile(user));
    }

    private String saveUserResume(MultipartFile file, Long userId) {
        try {
            Path uploadPath = Paths.get(uploadDir, "resumes");
            Files.createDirectories(uploadPath);

            String fileName = "resume_" + userId + "_" + System.currentTimeMillis() + ".pdf";
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/resumes/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save resume: " + e.getMessage());
        }
    }
}
