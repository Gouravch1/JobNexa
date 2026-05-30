package com.jobportal.repository;

import com.jobportal.entity.MockInterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MockInterviewQuestionRepository extends JpaRepository<MockInterviewQuestion, Long> {
    List<MockInterviewQuestion> findBySessionIdOrderByQuestionOrderAsc(Long sessionId);

    Optional<MockInterviewQuestion> findBySessionIdAndQuestionOrder(Long sessionId, Integer questionOrder);
}
