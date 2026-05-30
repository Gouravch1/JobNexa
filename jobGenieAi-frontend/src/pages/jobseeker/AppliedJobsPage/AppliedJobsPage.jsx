import React, { useEffect, useState } from 'react';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import applicationService from '../../../services/applicationService';
import jobService from '../../../services/jobService';
import styles from './AppliedJobsPage.module.css';

const AppliedJobsPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.email?.split('@')[0] || 'User';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'internships'
  const [internshipJobIds, setInternshipJobIds] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [apps, internships] = await Promise.all([
          applicationService.getUserApplications(),
          jobService.getAllInternships().catch(() => []),
        ]);
        setApplications(apps || []);
        setInternshipJobIds((internships || []).map((i) => i.id));
        setError(null);
      } catch (e) {
        console.error('Error loading applications:', e);
        setError('Failed to load applied jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const jobApplications = applications.filter((app) => {
    const type = (app.jobType || '').toUpperCase();
    const isInternshipByType = type === 'INTERNSHIP';
    const isInternshipByList = internshipJobIds.includes(app.jobId);
    const isInternship = isInternshipByType || (!type && isInternshipByList);
    return !isInternship;
  });

  const internshipApplications = applications.filter((app) => {
    const type = (app.jobType || '').toUpperCase();
    const isInternshipByType = type === 'INTERNSHIP';
    const isInternshipByList = internshipJobIds.includes(app.jobId);
    return isInternshipByType || (!type && isInternshipByList);
  });

  const mapStatusLabel = (status) => {
    if (!status) return 'In Review';
    const s = status.toUpperCase();
    if (s === 'APPROVED') return 'Selected';
    if (s === 'REJECTED') return 'Rejected';
    if (s === 'INTERVIEW') return 'Interview In Progress';
    return 'In Review';
  };

  return (
    <div className={styles.page}>
      <DashboardNav userName={userName} userEmail={user.email} userType="Job Seeker" />

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Applied</h1>
            </div>
            <div className={styles.count}>{applications.length} Applications</div>
          </div>

          {loading && (
            <div className={styles.centerText}>Loading your applications...</div>
          )}

          {error && !loading && (
            <div className={styles.centerTextError}>{error}</div>
          )}

          {!loading && !error && applications.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📄</div>
              <h3 className={styles.emptyTitle}>No Applications Yet</h3>
            </div>
          )}

          {!loading && !error && applications.length > 0 && (
            <>
              <div className={styles.tabsRow}>
                <button
                  type="button"
                  className={`${styles.tabButton} ${
                    activeTab === 'jobs' ? styles.tabButtonActive : ''
                  }`}
                  onClick={() => setActiveTab('jobs')}
                >
                  Jobs ({jobApplications.length})
                </button>
                <button
                  type="button"
                  className={`${styles.tabButton} ${
                    activeTab === 'internships' ? styles.tabButtonActive : ''
                  }`}
                  onClick={() => setActiveTab('internships')}
                >
                  Internships ({internshipApplications.length})
                </button>
              </div>

              {activeTab === 'jobs' && (
                <>
                  {jobApplications.length === 0 ? (
                    <div className={styles.sectionEmpty}>No job applications yet.</div>
                  ) : (
                    <div className={styles.cardsGrid}>
                      {jobApplications.map((app) => (
                        <details key={app.id} className={styles.card}>
                          <summary className={styles.cardSummary}>
                            <div className={styles.cardHeader}>
                              <div>
                                <h2 className={styles.jobTitle}>{app.jobTitle}</h2>
                                <p className={styles.company}>{app.company}</p>
                              </div>
                              <div
                                className={styles.statusBadge}
                                data-status={(app.status || '').toLowerCase()}
                              >
                                {mapStatusLabel(app.status)}
                              </div>
                            </div>
                            <div className={styles.metricsRow}>
                              <div className={styles.metric}>
                                <span className={styles.metricLabel}>Resume</span>
                                <span className={styles.metricValue}>
                                  {typeof app.resumeScore === 'number'
                                    ? `${app.resumeScore.toFixed(0)}%`
                                    : '—'}
                                </span>
                              </div>
                              <div className={styles.metric}>
                                <span className={styles.metricLabel}>Interview</span>
                                <span className={styles.metricValue}>
                                  {typeof app.interviewScore === 'number'
                                    ? `${app.interviewScore.toFixed(0)}%`
                                    : '—'}
                                </span>
                              </div>
                            </div>
                          </summary>

                          {app.resumeUrl && (
                            <div className={styles.linkRow}>
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.resumeLink}
                              >
                                View Submitted Resume
                              </a>
                            </div>
                          )}

                          <div className={styles.feedbackBox}>
                            <div className={styles.feedbackLabel}>AI Feedback</div>
                            <div className={styles.feedbackText}>
                              {app.feedback ||
                                'Feedback will appear here after your interview is evaluated.'}
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'internships' && (
                <>
                  {internshipApplications.length === 0 ? (
                    <div className={styles.sectionEmpty}>No internship applications yet.</div>
                  ) : (
                    <div className={styles.cardsGrid}>
                      {internshipApplications.map((app) => (
                        <details key={app.id} className={styles.card}>
                          <summary className={styles.cardSummary}>
                            <div className={styles.cardHeader}>
                              <div>
                                <h2 className={styles.jobTitle}>{app.jobTitle}</h2>
                                <p className={styles.company}>{app.company}</p>
                              </div>
                              <div
                                className={styles.statusBadge}
                                data-status={(app.status || '').toLowerCase()}
                              >
                                {mapStatusLabel(app.status)}
                              </div>
                            </div>
                            <div className={styles.metricsRow}>
                              <div className={styles.metric}>
                                <span className={styles.metricLabel}>Resume</span>
                                <span className={styles.metricValue}>
                                  {typeof app.resumeScore === 'number'
                                    ? `${app.resumeScore.toFixed(0)}%`
                                    : '—'}
                                </span>
                              </div>
                              <div className={styles.metric}>
                                <span className={styles.metricLabel}>Interview</span>
                                <span className={styles.metricValue}>
                                  {typeof app.interviewScore === 'number'
                                    ? `${app.interviewScore.toFixed(0)}%`
                                    : '—'}
                                </span>
                              </div>
                            </div>
                          </summary>

                          {app.resumeUrl && (
                            <div className={styles.linkRow}>
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.resumeLink}
                              >
                                View Submitted Resume
                              </a>
                            </div>
                          )}

                          <div className={styles.feedbackBox}>
                            <div className={styles.feedbackLabel}>AI Feedback</div>
                            <div className={styles.feedbackText}>
                              {app.feedback ||
                                'Feedback will appear here after your interview is evaluated.'}
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default AppliedJobsPage;

