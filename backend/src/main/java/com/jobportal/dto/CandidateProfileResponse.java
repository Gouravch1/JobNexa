package com.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileResponse {
    private Long applicationId;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String location;
    private String bio;
    private String skills;
    private String experience;
    private String education;
    private String profileResumeUrl;
    private String applicationResumeUrl;
    private String jobTitle;
    private String company;
    private String status;
    private Double resumeScore;
    private Double interviewScore;
    private String feedback;
    private LocalDateTime appliedAt;
}
