package com.jobportal.service;

import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.InterviewRepository;
import com.jobportal.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;

    public JobResponse createJob(JobRequest request, Long createdBy) {
        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .skills(request.getSkills())
                .company(request.getCompany())
                .location(request.getLocation())
                .experience(request.getExperience())
                .salaryRange(request.getSalaryRange())
                .type(request.getType().toUpperCase())
                .createdBy(createdBy)
                .build();

        job = jobRepository.save(job);
        return mapToResponse(job);
    }

    public List<JobResponse> getAllJobs() {
        return jobRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<JobResponse> getJobsByCreatedBy(Long createdBy) {
        return jobRepository.findByCreatedBy(createdBy).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<JobResponse> getJobsByType(String type) {
        return jobRepository.findByType(type.toUpperCase()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return mapToResponse(job);
    }

    @Transactional
    public void deleteJob(Long id, Long requestedBy) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getCreatedBy() == null || !job.getCreatedBy().equals(requestedBy)) {
            throw new RuntimeException("Not allowed to delete jobs created by other admins");
        }

        // Cascade delete: interviews → applications → job
        List<Application> applications = applicationRepository.findByJobId(id);
        if (!applications.isEmpty()) {
            List<Long> appIds = applications.stream().map(Application::getId).collect(Collectors.toList());
            log.info("Deleting {} interviews for job {}", appIds.size(), id);
            interviewRepository.deleteByApplicationIdIn(appIds);
            log.info("Deleting {} applications for job {}", applications.size(), id);
            applicationRepository.deleteByJobId(id);
        }

        log.info("Deleting job {}", id);
        jobRepository.deleteById(id);
    }

    private JobResponse mapToResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .skills(job.getSkills())
                .company(job.getCompany())
                .location(job.getLocation())
                .experience(job.getExperience())
                .salaryRange(job.getSalaryRange())
                .type(job.getType())
                .createdBy(job.getCreatedBy())
                .createdAt(job.getCreatedAt())
                .build();
    }
}
