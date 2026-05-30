import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import jobService from '../../../services/jobService';
import applicationService from '../../../services/applicationService';
import userService from '../../../services/userService';
import { useNotification } from '../../../context/NotificationContext';
import styles from './JobDetailsPage.module.css';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.email?.split('@')[0] || 'User';

    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applying, setApplying] = useState(false);
    const [hasSavedResume, setHasSavedResume] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                setLoading(true);
                const data = await jobService.getJobById(id);

                if (!data) {
                    setError('Job not found.');
                    return;
                }

                const requirements =
                    data.skills && typeof data.skills === 'string'
                        ? data.skills
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                        : [];

                const transformedJob = {
                    id: data.id,
                    title: data.title,
                    company: data.company || 'Company',
                    location: data.location || 'Location not specified',
                    experience: data.experience || '',
                    salary: data.salaryRange || '',
                    type: data.type || 'Job',
                    posted: data.createdAt
                        ? new Date(data.createdAt).toLocaleDateString()
                        : '',
                    badge: (data.company || 'JB').substring(0, 2).toUpperCase(),
                    description: data.description || 'No description available',
                    requirements,
                };

                setJobDetails(transformedJob);
                setError(null);
            } catch (err) {
                console.error('Error fetching job details:', err);
                setError('Failed to load job details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        const loadMe = async () => {
            try {
                const me = await userService.getCurrentProfile();
                setHasSavedResume(!!me?.resumeUrl);
            } catch {
                // ignore
            }
        };

        const loadApplications = async () => {
            try {
                const apps = await applicationService.getUserApplications();
                const applied = (apps || []).some(
                    (app) => String(app.jobId) === String(id)
                );
                setHasApplied(applied);
            } catch {
                // ignore
            }
        };

        fetchJobDetails();
        loadMe();
        loadApplications();
    }, [id]);

    const submitApplication = async (file) => {
        if (!jobDetails) return;
        try {
            setApplying(true);
            const result = await applicationService.applyToJob({
                jobId: jobDetails.id,
                useSavedResume: !file,
                file,
            });

            if (result.status === 'INTERVIEW') {
                const scoreText = (result.resumeScore ?? 0).toFixed(0);
                showNotification(
                    `Resume Score: ${scoreText}% • Starting your AI interview...`,
                    { type: 'success', duration: 2000 }
                );
                setTimeout(() => {
                    window.location.href = `/interview/${result.id}`;
                }, 2000);
            } else if (result.status === 'REJECTED') {
                const scoreText = (result.resumeScore ?? 0).toFixed(0);
                showNotification(
                    `Resume Score: ${scoreText}% • Your resume did not meet the minimum match threshold for this role.`,
                    { type: 'error', duration: 3000 }
                );
            } else {
                showNotification('Application submitted successfully.', { type: 'success' });
            }
            setHasApplied(true);
        } catch (e) {
            console.error('Error applying to job:', e);
            showNotification('Failed to apply. Please try again.', { type: 'error' });
        } finally {
            setApplying(false);
        }
    };

    const handleApply = async () => {
        if (!jobDetails || hasApplied) return;

        if (hasSavedResume) {
            setShowResumeModal(true);
            return;
        }

        fileInputRef.current?.click();
    };

    const handleFileSelected = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await submitApplication(file);
        event.target.value = '';
    };

    const handleResumeModalUseSaved = async () => {
        setShowResumeModal(false);
        await submitApplication(null);
    };

    const handleResumeModalUploadNew = () => {
        setShowResumeModal(false);
        fileInputRef.current?.click();
    };

    return (
        <div className={styles.page}>
            <DashboardNav userName={userName} userEmail={user.email} userType="Job Seeker" />

            <main className={styles.main}>
                <div className={styles.container}>
                    <button onClick={() => navigate('/jobs')} className={styles.backButton}>
                        ← Back to Jobs
                    </button>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            Loading job details...
                        </div>
                    )}

                    {error && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && jobDetails && (
                        <div className={styles.contentWrapper}>
                            <div className={styles.leftPanel}>
                                <div className={styles.header}>
                                    <div>
                                        <h1 className={styles.title}>{jobDetails.title}</h1>
                                        <p className={styles.company}>
                                            {jobDetails.company} • {jobDetails.location}
                                        </p>
                                    </div>
                                    <div className={styles.badge}>{jobDetails.badge}</div>
                                </div>

                                <div className={styles.tags}>
                                    <span className={styles.tag}>{jobDetails.type}</span>
                                    {jobDetails.experience && (
                                        <span className={styles.tag}>{jobDetails.experience}</span>
                                    )}
                                </div>

                                <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Job Description</h2>
                                    <p className={styles.text}>{jobDetails.description}</p>
                                </section>

                                {jobDetails.requirements && jobDetails.requirements.length > 0 && (
                                    <section className={styles.section}>
                                        <h2 className={styles.sectionTitle}>Key Skills / Requirements</h2>
                                        <ul className={styles.list}>
                                            {jobDetails.requirements.map((req, idx) => (
                                                <li key={idx}>{req}</li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>

                            <div className={styles.rightPanel}>
                                <div className={styles.summaryCard}>
                                    <h3 className={styles.summaryTitle}>Job Summary</h3>

                                    <div className={styles.summaryItem}>
                                        <span className={styles.label}>Company</span>
                                        <span className={styles.value}>{jobDetails.company}</span>
                                    </div>

                                    <div className={styles.summaryItem}>
                                        <span className={styles.label}>Location</span>
                                        <span className={styles.value}>{jobDetails.location}</span>
                                    </div>

                                    <div className={styles.summaryItem}>
                                        <span className={styles.label}>Job Type</span>
                                        <span className={styles.value}>{jobDetails.type}</span>
                                    </div>

                                    {jobDetails.experience && (
                                        <div className={styles.summaryItem}>
                                            <span className={styles.label}>Experience</span>
                                            <span className={styles.value}>{jobDetails.experience}</span>
                                        </div>
                                    )}

                                    {jobDetails.salary && (
                                        <div className={styles.summaryItem}>
                                            <span className={styles.label}>Salary Range</span>
                                            <span className={styles.value}>{jobDetails.salary}</span>
                                        </div>
                                    )}

                                    <div className={styles.summaryItem}>
                                        <span className={styles.label}>Posted Date</span>
                                        <span className={styles.value}>{jobDetails.posted}</span>
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".pdf"
                                        style={{ display: 'none' }}
                                        onChange={handleFileSelected}
                                    />
                                    <button
                                        onClick={handleApply}
                                        className={styles.applyButton}
                                        disabled={applying || hasApplied}
                                    >
                                        {hasApplied ? 'Applied' : applying ? 'Applying...' : 'Apply Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                    {showResumeModal && (
                        <div className={styles.resumeModalOverlay}>
                            <div className={styles.resumeModal}>
                                <h3 className={styles.resumeModalTitle}>Use saved resume?</h3>
                                <p className={styles.resumeModalText}>
                                    Use your saved resume from your profile for this application? Click
                                    &nbsp;
                                    <strong>Upload different resume</strong> to choose another PDF just for this job.
                                </p>
                                <div className={styles.resumeModalActions}>
                                    <button
                                        type="button"
                                        className={styles.resumeModalPrimary}
                                        onClick={handleResumeModalUseSaved}
                                    >
                                        Use Saved Resume
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.resumeModalSecondary}
                                        onClick={handleResumeModalUploadNew}
                                    >
                                        Upload Different Resume
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
            </main >

            <DashboardFooter />
        </div >
    );
};

export default JobDetailsPage;
