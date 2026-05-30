package com.jobportal.repository;

import com.jobportal.entity.MockInterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MockInterviewSessionRepository extends JpaRepository<MockInterviewSession, Long> {
}
