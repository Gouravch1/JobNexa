package com.jobportal.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InterviewResultResponse {
    private Long applicationId;
    private Double overallScore;
    private String feedback;
    private List<QuestionResult> questions;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class QuestionResult {
        private int questionNumber;
        private String question;
        private String answer;
        private Double score;
    }
}
