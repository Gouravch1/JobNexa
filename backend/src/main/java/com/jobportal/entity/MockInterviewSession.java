package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mock_interview_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockInterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String testId;

    @Column(nullable = false)
    private String testName;

    private Double overallScore;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(nullable = false)
    private boolean submitted;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (!this.submitted) {
            this.submitted = false;
        }
    }
}
