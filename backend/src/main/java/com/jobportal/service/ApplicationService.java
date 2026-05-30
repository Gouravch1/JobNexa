package com.jobportal.service;

import com.jobportal.dto.ApplicationResponse;
import com.jobportal.dto.CandidateProfileResponse;
import com.jobportal.entity.*;
import com.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ResumeParserService resumeParserService;
    private final ResumeMatchingService resumeMatchingService;
    private final EmailService emailService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ApplicationResponse applyForJob(Long userId, Long jobId, MultipartFile resume) {
        if (applicationRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        String resumeText;

        String resumeUrlForApplication;

        if (resume != null && !resume.isEmpty()) {
            // Save resume file
            String resumeUrl = saveResume(resume, userId, jobId);
            resumeUrlForApplication = resumeUrl;

            // Update user resume URL (treat latest upload as "default")
            user.setResumeUrl(resumeUrl);
            userRepository.save(user);

            // Extract text and calculate match score
            resumeText = resumeParserService.extractTextFromPdf(resume);
        } else {
            // Use user's saved resume
            if (user.getResumeUrl() == null || user.getResumeUrl().trim().isEmpty()) {
                throw new RuntimeException("No resume provided. Please upload a resume in your profile or attach one while applying.");
            }
            resumeUrlForApplication = user.getResumeUrl();
            byte[] pdfBytes = readResumeBytesFromUrl(user.getResumeUrl());
            resumeText = resumeParserService.extractTextFromPdf(pdfBytes);
        }

        double matchScore = resumeMatchingService.calculateMatchScore(resumeText,
                job.getDescription() + " " + job.getSkills());

        // Auto-decide: >= 50% -> INTERVIEW, < 50% -> REJECTED
        ApplicationStatus autoStatus = matchScore >= 50.0
                ? ApplicationStatus.INTERVIEW
                : ApplicationStatus.REJECTED;

        Application application = Application.builder()
                .user(user)
                .job(job)
                .resumeUrl(resumeUrlForApplication)
                .resumeScore(matchScore)
                .status(autoStatus)
                .build();

        application = applicationRepository.save(application);
        return mapToResponse(application);
    }

    public List<ApplicationResponse> getUserApplications(Long userId) {
        return applicationRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getJobApplications(Long jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getJobApplicationsForAdmin(Long adminId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (job.getCreatedBy() == null || !job.getCreatedBy().equals(adminId)) {
            throw new RuntimeException("Not allowed to view applications for other admins");
        }
        return getJobApplications(jobId);
    }

    public List<ApplicationResponse> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicationsForAdmin(Long adminId) {
        return applicationRepository.findByJobCreatedBy(adminId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ApplicationResponse updateStatus(Long applicationId, String status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        return applyStatusChange(application, status);
    }

    public ApplicationResponse updateStatusForAdmin(Long adminId, Long applicationId, String status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        Long jobOwner = application.getJob() != null ? application.getJob().getCreatedBy() : null;
        if (jobOwner == null || !jobOwner.equals(adminId)) {
            throw new RuntimeException("Not allowed to update applications for other admins");
        }
        return applyStatusChange(application, status);
    }

    private ApplicationResponse applyStatusChange(Application application, String status) {
        ApplicationStatus previousStatus = application.getStatus();
        ApplicationStatus newStatus = ApplicationStatus.valueOf(status.toUpperCase());
        application.setStatus(newStatus);
        application = applicationRepository.save(application);

        if (newStatus == ApplicationStatus.APPROVED && previousStatus != ApplicationStatus.APPROVED) {
            log.info("Application {} accepted — sending email to candidate", application.getId());
            notifyCandidateOnAcceptance(application);
        }

        return mapToResponse(application);
    }

    private void notifyCandidateOnAcceptance(Application application) {
        User candidate = application.getUser();
        Job job = application.getJob();
        if (candidate != null && job != null) {
            emailService.sendApplicationAcceptedEmail(candidate, job, application);
        }
    }

    public Application getApplicationEntity(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public CandidateProfileResponse getCandidateProfileForAdmin(Long adminId, Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Long jobOwner = application.getJob() != null ? application.getJob().getCreatedBy() : null;
        if (jobOwner == null || !jobOwner.equals(adminId)) {
            throw new RuntimeException("Not allowed to view this candidate");
        }

        User user = application.getUser();
        if (user == null) {
            throw new RuntimeException("Candidate not found");
        }

        return CandidateProfileResponse.builder()
                .applicationId(application.getId())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .location(user.getLocation())
                .bio(user.getBio())
                .skills(user.getSkills())
                .experience(user.getExperience())
                .education(user.getEducation())
                .profileResumeUrl(user.getResumeUrl())
                .applicationResumeUrl(application.getResumeUrl())
                .jobTitle(application.getJob().getTitle())
                .company(application.getJob().getCompany())
                .status(application.getStatus().name())
                .resumeScore(application.getResumeScore())
                .interviewScore(application.getInterviewScore())
                .feedback(application.getFeedback())
                .appliedAt(application.getCreatedAt())
                .build();
    }

    private String saveResume(MultipartFile file, Long userId, Long jobId) {
        try {
            Path uploadPath = Paths.get(uploadDir, "resumes");
            Files.createDirectories(uploadPath);

            String fileName = "resume_" + userId + "_" + jobId + "_" + System.currentTimeMillis() + ".pdf";
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/resumes/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save resume: " + e.getMessage());
        }
    }

    private ApplicationResponse mapToResponse(Application app) {
        return ApplicationResponse.builder()
                .id(app.getId())
                .userId(app.getUser().getId())
                .userName(app.getUser().getName())
                .userEmail(app.getUser().getEmail())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .company(app.getJob().getCompany())
                .jobType(app.getJob().getType())
                .resumeUrl(app.getResumeUrl())
                .resumeScore(app.getResumeScore())
                .interviewScore(app.getInterviewScore())
                .status(app.getStatus().name())
                .feedback(app.getFeedback())
                .createdAt(app.getCreatedAt())
                .build();
    }

    private byte[] readResumeBytesFromUrl(String resumeUrl) {
        try {
            // Accept either "/uploads/resumes/file.pdf" or "uploads/resumes/file.pdf"
            String normalized = resumeUrl.startsWith("/") ? resumeUrl.substring(1) : resumeUrl;
            Path p1 = Paths.get("." + (resumeUrl.startsWith("/") ? resumeUrl : "/" + resumeUrl));
            if (Files.exists(p1)) {
                return Files.readAllBytes(p1);
            }

            Path p2 = Paths.get(normalized);
            if (Files.exists(p2)) {
                return Files.readAllBytes(p2);
            }

            Path p3 = Paths.get("uploads", "resumes", resumeUrl.substring(resumeUrl.lastIndexOf("/") + 1));
            if (Files.exists(p3)) {
                return Files.readAllBytes(p3);
            }

            throw new RuntimeException("Saved resume file not found");
        } catch (Exception e) {
            throw new RuntimeException("Could not read saved resume: " + e.getMessage());
        }
    }
}
