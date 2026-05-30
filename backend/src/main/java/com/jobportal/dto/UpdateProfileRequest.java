package com.jobportal.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String location;
    private String bio;
    private String skills;
    private String experience;
    private String education;
}
