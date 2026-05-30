import React, { useEffect, useRef, useState } from 'react';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import JobListCard from '../../../components/JobListCard/JobListCard';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import jobService from '../../../services/jobService';
import applicationService from '../../../services/applicationService';
import { getSavedJobs, isSaved, saveJob, removeJob } from '../../../services/savedJobsService';
import userService from '../../../services/userService';
import { useNotification } from '../../../context/NotificationContext';
import styles from './JobsPage.module.css';

const JobsPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.email?.split('@')[0] || 'User';

    const { showNotification } = useNotification();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [applyingTo, setApplyingTo] = useState(null);
    const [hasSavedResume, setHasSavedResume] = useState(false);
    const [resumeModalJobId, setResumeModalJobId] = useState(null);
    const [savedSnapshot, setSavedSnapshot] = useState(() => getSavedJobs());
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const data = await jobService.getAllJobs();

                const transformedJobs = data.map(job => ({
                    id: job.id,
                    title: job.title,
                    company: job.company || 'Company',
                    description: job.description || 'No description available',
                    type: job.type,
                    level: job.experience || '',
                    category: 'Technology',
                    location: job.location || 'Location not specified',
                    posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '',
                    badge: (job.company || 'JB').substring(0, 2).toUpperCase(),
                    skills: job.skills || '',
                    salary: job.salaryRange || '',
                }));

                setJobs(transformedJobs);
                setError(null);
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setError('Failed to load jobs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        const loadUserApplications = async () => {
            try {
                const apps = await applicationService.getUserApplications();
                setAppliedJobs(new Set((apps || []).map(a => a.jobId)));
            } catch {
                // ignore
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

        fetchJobs();
        if (user) {
            loadUserApplications();
            loadMe();
        }
    }, []);

    const handleSaveJob = (job) => {
        saveJob({ ...job, kind: 'JOB' });
        setSavedSnapshot(getSavedJobs());
    };

    const handleRemoveSavedJob = (jobId) => {
        removeJob('JOB', jobId);
        setSavedSnapshot(getSavedJobs());
    };

    const submitApplication = async (jobId, file) => {
        try {
            const result = await applicationService.applyToJob({
                jobId,
                useSavedResume: !file,
                file,
            });

            setAppliedJobs(prev => new Set([...prev, jobId]));

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
        } catch (err) {
            console.error('Error applying to job:', err);
            showNotification('Failed to apply. Please try again.', { type: 'error' });
        } finally {
            setApplyingTo(null);
        }
    };

    const handleApply = (jobId) => {
        setApplyingTo(jobId);

        if (hasSavedResume) {
            setResumeModalJobId(jobId);
            return;
        }

        fileInputRef.current?.click();
    };

    const handleFileSelected = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !applyingTo) return;
        await submitApplication(applyingTo, file);
        event.target.value = '';
    };

    const handleResumeModalUseSaved = async () => {
        if (!resumeModalJobId) return;
        await submitApplication(resumeModalJobId, null);
        setResumeModalJobId(null);
    };

    const handleResumeModalUploadNew = () => {
        if (!resumeModalJobId) return;
        setApplyingTo(resumeModalJobId);
        setResumeModalJobId(null);
        fileInputRef.current?.click();
    };

    const filteredJobs = jobs.filter(job => {
        const term = search.toLowerCase();
        if (!term) return true;
        return (
            job.title.toLowerCase().includes(term) ||
            job.company.toLowerCase().includes(term) ||
            (job.skills || '').toLowerCase().includes(term)
        );
    });

    return (
        <div className={styles.page}>
            <DashboardNav userName={userName} userEmail={user.email} userType="Job Seeker" />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Available Jobs</h1>
                    </div>

                    <div className={styles.searchRow}>
                        <div className={styles.searchWrapper}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={styles.searchInput}
                                placeholder="Search by title, company or skills..."
                            />
                            <button
                                type="button"
                                className={styles.searchButton}
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className={`${styles.stateBlock} ${styles.stateMuted}`}>
                            Loading jobs...
                        </div>
                    )}

                    {error && (
                        <div className={`${styles.stateBlock} ${styles.stateError}`}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && filteredJobs.length === 0 && (
                        <div className={`${styles.stateBlock} ${styles.stateMuted}`}>
                            No jobs found matching your criteria.
                        </div>
                    )}

                    {!loading && !error && filteredJobs.length > 0 && (
                        <div className={styles.jobsGrid}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".pdf"
                                style={{ display: 'none' }}
                                onChange={handleFileSelected}
                            />
                            {filteredJobs.map(job => (
                                <JobListCard
                                    key={job.id}
                                    job={job}
                                    type="job"
                                    applied={appliedJobs.has(job.id)}
                                    onApply={() => handleApply(job.id)}
                                    onSave={() => handleSaveJob(job)}
                                    onRemove={() => handleRemoveSavedJob(job.id)}
                                    isSaved={isSaved('JOB', job.id)}
                                />
                            ))}
                        </div>
                    )}
                    {resumeModalJobId && (
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
                </div>
            </main>

            <DashboardFooter />
        </div>
    );
};

export default JobsPage;
