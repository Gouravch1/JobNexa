package com.jobportal.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long jobId;
    private String jobTitle;
    private String company;
    private String jobType;
    private String resumeUrl;
    private Double resumeScore;
    private Double interviewScore;
    private String status;
    private String feedback;
    private LocalDateTime createdAt;
}
