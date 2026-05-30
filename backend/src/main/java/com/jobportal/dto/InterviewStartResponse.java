package com.jobportal.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InterviewStartResponse {
    private Long applicationId;
    private int totalQuestions;
    private String message;
}
