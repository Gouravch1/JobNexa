package com.jobportal.service;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:}")
    private String fromEmail;

    @Value("${app.mail.from-name:JobGenie AI}")
    private String fromName;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @jakarta.annotation.PostConstruct
    void logMailSetup() {
        log.info("Mail config — enabled={}, from={}, smtpUser={}",
                mailEnabled, fromEmail, mailUsername == null || mailUsername.isBlank() ? "(not set)" : mailUsername);
        if (!isMailActive()) {
            log.warn("Acceptance emails are OFF. Set app.mail.enabled=true and spring.mail.username/password in application-local.yml");
        }
    }

    public void sendApplicationAcceptedEmail(User candidate, Job job, Application application) {
        if (!isMailActive()) {
            log.warn("Skipping acceptance email for application {} — mail is not configured", application.getId());
            return;
        }

        if (candidate == null || candidate.getEmail() == null || candidate.getEmail().isBlank()) {
            log.warn("Cannot send acceptance email — candidate email missing for application {}", application.getId());
            return;
        }

        if (Boolean.FALSE.equals(candidate.getEmailNotifications())) {
            log.debug("Candidate opted out of email notifications: {}", candidate.getEmail());
            return;
        }

        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("Mail from address not configured — acceptance email not sent");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(candidate.getEmail());
            helper.setSubject("Your application has been accepted — " + safe(job.getTitle()));
            helper.setText(buildAcceptedEmailHtml(candidate, job, application), true);
            mailSender.send(message);
            log.info("Acceptance email sent to {} for job {}", candidate.getEmail(), job.getTitle());
        } catch (Exception e) {
            log.error("Failed to send acceptance email to {}: {}", candidate.getEmail(), e.getMessage(), e);
        }
    }

    private boolean isMailActive() {
        if (mailEnabled) {
            return fromEmail != null && !fromEmail.isBlank()
                    && mailUsername != null && !mailUsername.isBlank();
        }
        return false;
    }

    private String buildAcceptedEmailHtml(User candidate, Job job, Application application) {
        String candidateName = safe(candidate.getName());
        String jobTitle = safe(job.getTitle());
        String company = safe(job.getCompany());
        String location = job.getLocation() != null ? safe(job.getLocation()) : "Not specified";

        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 24px;">
                  <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; font-size: 22px;">Application Accepted</h1>
                  </div>
                  <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
                    <p>Hi %s,</p>
                    <p>Great news! The recruiter has <strong>accepted</strong> your application.</p>
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 20px 0;">
                      <p style="margin: 0 0 8px;"><strong>Role:</strong> %s</p>
                      <p style="margin: 0 0 8px;"><strong>Company:</strong> %s</p>
                      <p style="margin: 0 0 8px;"><strong>Location:</strong> %s</p>
                      <p style="margin: 0;"><strong>Application ID:</strong> #%d</p>
                    </div>
                    <p>The hiring team may contact you with next steps. You can also log in to jobnexa to track your applications.</p>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">Best of luck,<br/>The JobGenie AI Team</p>
                  </div>
                </body>
                </html>
                """.formatted(candidateName, jobTitle, company, location, application.getId());
    }

    private String safe(String value) {
        return value == null ? "" : value.replace("<", "&lt;").replace(">", "&gt;");
    }
}
