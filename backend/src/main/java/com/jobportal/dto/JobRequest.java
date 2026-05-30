package com.jobportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Skills are required")
    private String skills;

    @NotBlank(message = "Company is required")
    private String company;

    private String location;

    // Optional: human-readable experience, e.g. "2-4 years"
    private String experience;

    // Optional: salary range, e.g. "₹10-15 LPA"
    private String salaryRange;

    @NotBlank(message = "Type is required (JOB or INTERNSHIP)")
    private String type;
}
