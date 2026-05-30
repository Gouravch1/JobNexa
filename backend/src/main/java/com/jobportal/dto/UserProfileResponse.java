package com.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long userId;
    private String name;
    private String fullName;
    private String email;
    private String role;
    private String resumeUrl;
    private String phone;
    private String location;
    private String bio;
    private String skills;
    private String experience;
    private String education;
}

