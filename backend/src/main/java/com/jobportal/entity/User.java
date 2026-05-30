package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String resumeUrl;

    private String phone;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String experience;

    @Column(columnDefinition = "TEXT")
    private String education;

    @Builder.Default
    private Boolean emailNotifications = true;

    @Builder.Default
    private Boolean jobAlerts = true;

    @Builder.Default
    private Boolean applicationUpdates = true;

    @Builder.Default
    private Boolean weeklyNewsletter = false;

    @Builder.Default
    private String profileVisibility = "public";

    @Builder.Default
    private Boolean showEmail = false;

    @Builder.Default
    private Boolean showPhone = false;

    @Builder.Default
    private String language = "en";

    @Builder.Default
    private String timezone = "Asia/Kolkata";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
