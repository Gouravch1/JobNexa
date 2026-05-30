import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import interviewService from '../../../services/interviewService';
import styles from './InterviewResultPage.module.css';

const InterviewResultPage = () => {
  const { applicationId, sessionId } = useParams();
  const isMockMode = !!sessionId;
  const resultKey = isMockMode ? sessionId : applicationId;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.email?.split('@')[0] || 'User';

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await interviewService.getResult(resultKey, { mode: isMockMode ? 'mock' : 'job' });
        setResult(data);
      } catch (e) {
        console.error('Failed to load interview result', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resultKey, isMockMode]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={styles.page}>
        <DashboardNav userName={userName} userEmail={user.email} userType="Job Seeker" />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.cardCentered}>
              <p className={styles.subtitle}>Result not found.</p>
            </div>
          </div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  const score = result.overallScore || 0;
  const scoreColor =
    score >= 70 ? styles.scoreGood : score >= 50 ? styles.scoreMedium : styles.scoreLow;

  return (
    <div className={styles.page}>
      <DashboardNav userName={userName} userEmail={user.email} userType="Job Seeker" />
      <main className={styles.main}>
        <div className={styles.container}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={styles.backButton}
          >
            ← Back to Dashboard
          </button>

          <div className={styles.scoreCard}>
            <h1 className={styles.title}>{isMockMode ? 'Mock Interview Results' : 'Interview Results'}</h1>
            <div className={styles.scoreCircleWrapper}>
              <div className={styles.scoreCircle}>
                <span className={`${styles.scoreValue} ${scoreColor}`}>{score.toFixed(0)}</span>
                <span className={styles.scoreMax}>/ 100</span>
              </div>
            </div>
            <p className={`${styles.scoreLabel} ${scoreColor}`}>
              {score >= 70 ? 'Excellent Performance!' : score >= 50 ? 'Good Performance' : 'Needs Improvement'}
            </p>
          </div>

          <div className={styles.feedbackCard}>
            <h2 className={styles.sectionTitle}>AI Feedback</h2>
            <p className={styles.feedbackText}>{result.feedback}</p>
          </div>

          <div className={styles.questionsSection}>
            <h2 className={styles.sectionTitle}>Question Breakdown</h2>
            <div className={styles.questionsList}>
              {(result.questions || []).map((q) => (
                <div key={q.questionNumber} className={styles.questionCard}>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionBadge}>Q{q.questionNumber}</span>
                    <span className={styles.questionScore}>{q.score?.toFixed(0)}/100</span>
                  </div>
                  <p className={styles.questionText}>{q.question}</p>
                  <p className={styles.answerText}>
                    <span className={styles.answerLabel}>Your answer:</span>{' '}
                    {q.answer || 'No answer provided'}
                  </p>
                  <div className={styles.scoreBarOuter}>
                    <div
                      className={styles.scoreBarInner}
                      style={{ width: `${q.score || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
};

export default InterviewResultPage;

