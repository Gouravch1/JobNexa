package com.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockTestStartResponse {
    private String testId;
    private String testName;
    private int totalQuestions;
    private int questionPoolSize;
    private List<String> questions;
}
