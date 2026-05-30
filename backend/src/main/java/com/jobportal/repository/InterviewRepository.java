package com.jobportal.repository;

import com.jobportal.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationIdOrderByQuestionOrderAsc(Long applicationId);

    Optional<Interview> findByApplicationIdAndQuestionOrder(Long applicationId, Integer questionOrder);

    long countByApplicationId(Long applicationId);

    List<Interview> findByApplicationIdAndAnswerIsNotNull(Long applicationId);

    void deleteByApplicationId(Long applicationId);

    void deleteByApplicationIdIn(List<Long> applicationIds);
}
