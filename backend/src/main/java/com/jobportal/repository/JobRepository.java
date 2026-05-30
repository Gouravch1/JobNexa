package com.jobportal.repository;

import com.jobportal.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByType(String type);

    List<Job> findByCreatedBy(Long createdBy);

    long countByCreatedBy(Long createdBy);

    List<Job> findAllByOrderByCreatedAtDesc();
}
