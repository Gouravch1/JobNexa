package com.jobportal.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InterviewQuestionResponse {
    private Long interviewId;
    private int questionNumber;
    private int totalQuestions;
    private String questionText;
    private String audioUrl;
    private boolean isLastQuestion;
}
