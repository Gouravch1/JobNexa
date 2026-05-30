package com.jobportal.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserSettingsRequest {
    private String email;
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
    private Boolean emailNotifications;
    private Boolean jobAlerts;
    private Boolean applicationUpdates;
    private Boolean weeklyNewsletter;
    private String profileVisibility;
    private Boolean showEmail;
    private Boolean showPhone;
    private String language;
    private String timezone;
}
