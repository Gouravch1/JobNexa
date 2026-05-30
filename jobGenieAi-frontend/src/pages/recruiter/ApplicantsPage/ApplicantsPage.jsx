import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import styles from './ApplicantsPage.module.css';
import adminService from '../../../services/adminService';
import { useNotification } from '../../../context/NotificationContext';
import CandidateProfileModal from '../../../components/CandidateProfileModal/CandidateProfileModal';

const BACKEND_URL = 'http://localhost:8080';

// Build a fully qualified URL for files served by the backend
const getResumeUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const ApplicantsPage = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.email?.split('@')[0] || 'User';

    const [applicants, setApplicants] = useState([]);
    const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
    const [profileApplicationId, setProfileApplicationId] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadApplicants = async () => {
            try {
                const data = await adminService.getAllApplications();
                if (!isMounted) return;

                const mapped = (data || [])
                    .filter((app) => !jobId || String(app.jobId) === String(jobId))
                    .map((app) => ({
                        id: app.id,
                        name: app.userName,
                        email: app.userEmail,
                        position: app.jobTitle,
                        appliedDate: app.createdAt || '',
                        status: (app.status || 'PENDING').toUpperCase(),
                        resumeScore: typeof app.resumeScore === 'number' ? app.resumeScore : null,
                        interviewScore: typeof app.interviewScore === 'number' ? app.interviewScore : null,
                        feedback: app.feedback || '',
                        resumeUrl: app.resumeUrl || '',
                    }));

                setApplicants(mapped);
            } catch (e) {
                console.error('Error fetching applicants:', e);
            }
        };

        loadApplicants();

        return () => {
            isMounted = false;
        };
    }, [jobId]);

    const handleStatusChange = async (applicantId, status) => {
        try {
            await adminService.updateApplicationStatus(applicantId, status);
            setApplicants(prev =>
                prev.map(app =>
                    app.id === applicantId ? { ...app, status } : app
                )
            );
        } catch (e) {
            console.error('Error updating applicant status:', e);
            showNotification('Failed to update applicant status.', { type: 'error' });
        }
    };

    const toggleFeedback = (id) => {
        setSelectedFeedbackId((prev) => (prev === id ? null : id));
    };

    return (
        <div className={styles.page}>
            <DashboardNav userName={userName} userEmail={user.email} userType="Recruiter" />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div>
                            <button onClick={() => navigate('/recruiter/posted-jobs')} className={styles.backButton}>
                                ← Back to Posted Jobs
                            </button>
                            <h1 className={styles.title}>Applicants</h1>
                            <p className={styles.subtitle}>{applicants.length} total applications</p>
                        </div>
                    </div>

                    {applicants.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            No applicants for this job yet.
                        </div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Resume</th>
                                        <th>Resume Score</th>
                                        <th>Interview Score</th>
                                        <th>Feedback</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applicants.map((applicant) => (
                                        <React.Fragment key={applicant.id}>
                                            <tr>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className={styles.candidateButton}
                                                        onClick={() => setProfileApplicationId(applicant.id)}
                                                        title="View candidate profile"
                                                    >
                                                        <div className={styles.candidateCell}>
                                                            <div className={styles.avatar}>
                                                                {applicant.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className={styles.candidateName}>{applicant.name}</div>
                                                                <div className={styles.candidateEmail}>{applicant.email}</div>
                                                                <span className={styles.viewProfileHint}>View profile →</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </td>
                                                <td>
                                                    {applicant.resumeUrl ? (
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            <a
                                                                href={getResumeUrl(applicant.resumeUrl)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={styles.resumeLink}
                                                            >
                                                                View PDF
                                                            </a>
                                                            <a
                                                                href={getResumeUrl(applicant.resumeUrl)}
                                                                download
                                                                className={styles.resumeLink}
                                                                style={{ background: 'none', border: '1px solid currentColor', opacity: 0.7 }}
                                                            >
                                                                ↓ Download
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td>
                                                    {typeof applicant.resumeScore === 'number'
                                                        ? `${applicant.resumeScore.toFixed(0)}%`
                                                        : '—'}
                                                </td>
                                                <td>
                                                    {typeof applicant.interviewScore === 'number'
                                                        ? `${applicant.interviewScore.toFixed(0)}%`
                                                        : '—'}
                                                </td>
                                                <td>
                                                    {applicant.feedback ? (
                                                        <button
                                                            type="button"
                                                            className={styles.feedbackToggle}
                                                            onClick={() => toggleFeedback(applicant.id)}
                                                        >
                                                            {selectedFeedbackId === applicant.id ? 'Hide' : 'View'} Feedback
                                                        </button>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`${styles.statusBadge} ${styles[applicant.status.toLowerCase()]}`}
                                                    >
                                                        {applicant.status === 'APPROVED'
                                                            ? 'Accepted'
                                                            : applicant.status === 'REJECTED'
                                                            ? 'Rejected'
                                                            : 'Pending'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        <button
                                                            type="button"
                                                            className={styles.acceptButton}
                                                            disabled={applicant.status === 'APPROVED'}
                                                            onClick={() => handleStatusChange(applicant.id, 'APPROVED')}
                                                        >
                                                            {applicant.status === 'APPROVED' ? 'Accepted' : 'Accept'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.rejectButton}
                                                            disabled={applicant.status === 'REJECTED'}
                                                            onClick={() => handleStatusChange(applicant.id, 'REJECTED')}
                                                        >
                                                            {applicant.status === 'REJECTED' ? 'Rejected' : 'Reject'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {selectedFeedbackId === applicant.id && applicant.feedback && (
                                                <tr className={styles.feedbackRow}>
                                                    <td colSpan={7}>
                                                        <div className={styles.feedbackBox}>
                                                            <div className={styles.feedbackLabel}>AI Feedback</div>
                                                            <div className={styles.feedbackText}>{applicant.feedback}</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <DashboardFooter />

            <CandidateProfileModal
                isOpen={profileApplicationId != null}
                applicationId={profileApplicationId}
                onClose={() => setProfileApplicationId(null)}
            />
        </div>
    );
};

export default ApplicantsPage;
