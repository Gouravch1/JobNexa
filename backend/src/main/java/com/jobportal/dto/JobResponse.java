package com.jobportal.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String skills;
    private String company;
    private String location;
    private String experience;
    private String salaryRange;
    private String type;
    private Long createdBy;
    private LocalDateTime createdAt;
}
