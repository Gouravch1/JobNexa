package com.jobportal.service;

import com.jobportal.dto.UpdateProfileRequest;
import com.jobportal.dto.UpdateUserSettingsRequest;
import com.jobportal.dto.UserProfileResponse;
import com.jobportal.dto.UserSettingsResponse;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserProfileResponse getProfile(String email) {
        return mapToProfile(getUserByEmail(email));
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getSkills() != null) {
            user.setSkills(request.getSkills().trim());
        }
        if (request.getExperience() != null) {
            user.setExperience(request.getExperience().trim());
        }
        if (request.getEducation() != null) {
            user.setEducation(request.getEducation().trim());
        }

        return mapToProfile(userRepository.save(user));
    }

    public UserSettingsResponse getSettings(String email) {
        return mapToSettings(getUserByEmail(email));
    }

    @Transactional
    public UserSettingsResponse updateSettings(String email, UpdateUserSettingsRequest request) {
        User user = getUserByEmail(email);

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim();
            if (!newEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new RuntimeException("Email is already in use");
                }
                user.setEmail(newEmail);
            }
        }

        boolean changingPassword = request.getNewPassword() != null && !request.getNewPassword().isBlank();
        if (changingPassword) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new RuntimeException("Current password is required to set a new password");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            if (request.getConfirmPassword() == null
                    || !request.getNewPassword().equals(request.getConfirmPassword())) {
                throw new RuntimeException("New password and confirmation do not match");
            }
            if (request.getNewPassword().length() < 6) {
                throw new RuntimeException("New password must be at least 6 characters");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        if (request.getEmailNotifications() != null) {
            user.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getJobAlerts() != null) {
            user.setJobAlerts(request.getJobAlerts());
        }
        if (request.getApplicationUpdates() != null) {
            user.setApplicationUpdates(request.getApplicationUpdates());
        }
        if (request.getWeeklyNewsletter() != null) {
            user.setWeeklyNewsletter(request.getWeeklyNewsletter());
        }
        if (request.getProfileVisibility() != null && !request.getProfileVisibility().isBlank()) {
            user.setProfileVisibility(request.getProfileVisibility().trim());
        }
        if (request.getShowEmail() != null) {
            user.setShowEmail(request.getShowEmail());
        }
        if (request.getShowPhone() != null) {
            user.setShowPhone(request.getShowPhone());
        }
        if (request.getLanguage() != null && !request.getLanguage().isBlank()) {
            user.setLanguage(request.getLanguage().trim());
        }
        if (request.getTimezone() != null && !request.getTimezone().isBlank()) {
            user.setTimezone(request.getTimezone().trim());
        }

        return mapToSettings(userRepository.save(user));
    }

    public UserProfileResponse mapToProfile(User user) {
        return UserProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .fullName(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .resumeUrl(user.getResumeUrl())
                .phone(user.getPhone())
                .location(user.getLocation())
                .bio(user.getBio())
                .skills(user.getSkills())
                .experience(user.getExperience())
                .education(user.getEducation())
                .build();
    }

    private UserSettingsResponse mapToSettings(User user) {
        return UserSettingsResponse.builder()
                .email(user.getEmail())
                .emailNotifications(boolOrDefault(user.getEmailNotifications(), true))
                .jobAlerts(boolOrDefault(user.getJobAlerts(), true))
                .applicationUpdates(boolOrDefault(user.getApplicationUpdates(), true))
                .weeklyNewsletter(boolOrDefault(user.getWeeklyNewsletter(), false))
                .profileVisibility(user.getProfileVisibility() != null ? user.getProfileVisibility() : "public")
                .showEmail(boolOrDefault(user.getShowEmail(), false))
                .showPhone(boolOrDefault(user.getShowPhone(), false))
                .language(user.getLanguage() != null ? user.getLanguage() : "en")
                .timezone(user.getTimezone() != null ? user.getTimezone() : "Asia/Kolkata")
                .build();
    }

    private boolean boolOrDefault(Boolean value, boolean defaultValue) {
        return value == null ? defaultValue : value;
    }
}
