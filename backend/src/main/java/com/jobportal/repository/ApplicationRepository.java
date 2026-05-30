package com.jobportal.repository;

import com.jobportal.entity.Application;
import com.jobportal.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserId(Long userId);

    List<Application> findByJobId(Long jobId);

    // Admin scoping (only applications for jobs created by this admin)
    List<Application> findByJobCreatedBy(Long createdBy);

    Optional<Application> findByUserIdAndJobId(Long userId, Long jobId);

    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    List<Application> findByStatus(ApplicationStatus status);

    long countByJobId(Long jobId);

    long countByJobCreatedBy(Long createdBy);

    void deleteByJobId(Long jobId);
}
