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
public class UserSettingsResponse {
    private String email;
    private boolean emailNotifications;
    private boolean jobAlerts;
    private boolean applicationUpdates;
    private boolean weeklyNewsletter;
    private String profileVisibility;
    private boolean showEmail;
    private boolean showPhone;
    private String language;
    private String timezone;
}
