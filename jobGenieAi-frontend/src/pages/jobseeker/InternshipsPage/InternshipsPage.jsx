import React, { useState, useEffect, useRef } from 'react';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import JobListCard from '../../../components/JobListCard/JobListCard';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import jobService from '../../../services/jobService';
import applicationService from '../../../services/applicationService';
import { getSavedJobs, isSaved, saveJob, removeJob } from '../../../services/savedJobsService';
import userService from '../../../services/userService';
import { useNotification } from '../../../context/NotificationContext';
import styles from './InternshipsPage.module.css';

const InternshipsPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.email?.split('@')[0] || 'User';

    const { showNotification } = useNotification();

    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [appliedInternships, setAppliedInternships] = useState(new Set());
    const [applyingTo, setApplyingTo] = useState(null);
    const [hasSavedResume, setHasSavedResume] = useState(false);
    const [resumeModalJobId, setResumeModalJobId] = useState(null);
    const fileInputRef = useRef(null);
    const [savedSnapshot, setSavedSnapshot] = useState(() => getSavedJobs());

    useEffect(() => {
        const fetchInternships = async () => {
            try {
                setLoading(true);
                const data = await jobService.getAllInternships();

                const transformedInternships = data.map(internship => ({
                    id: internship.id,
                    title: internship.title,
                    company: internship.company || 'Company',
                    description: internship.description || 'No description available',
                    type: 'INTERNSHIP',
                    level: 'Entry',
                    category: 'Technology',
                    location: internship.location || 'Location not specified',
                    posted: internship.createdAt ? new Date(internship.createdAt).toLocaleDateString() : '',
                    badge: (internship.company || 'IN').substring(0, 2).toUpperCase(),
                    skills: internship.skills || ''
                }));

                setInternships(transformedInternships);
                setError(null);
            } catch (err) {
                console.error('Error fetching internships:', err);
                setError('Failed to load internships. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        const loadUserApplications = async () => {
            try {
                const apps = await applicationService.getUserApplications();
                setAppliedInternships(new Set((apps || []).map(a => a.jobId)));
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

        fetchInternships();
        if (user) {
            loadUserApplications();
            loadMe();
        }
        // run once on mount; user comes from localStorage
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaveInternship = (internship) => {
        saveJob({ ...internship, kind: 'INTERNSHIP' });
        setSavedSnapshot(getSavedJobs());
    };

    const handleRemoveSavedInternship = (internshipId) => {
        removeJob('INTERNSHIP', internshipId);
        setSavedSnapshot(getSavedJobs());
    };

    const filteredInternships = internships.filter(internship => {
        const term = search.toLowerCase();
        if (!term) return true;
        return (
            internship.title.toLowerCase().includes(term) ||
            internship.company.toLowerCase().includes(term) ||
            (internship.skills || '').toLowerCase().includes(term)
        );
    });

    const submitApplication = async (jobId, file) => {
        try {
            const result = await applicationService.applyToJob({
                jobId,
                useSavedResume: !file,
                file,
            });

            setAppliedInternships(prev => new Set([...prev, jobId]));

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
            console.error('Error applying to internship:', err);
            showNotification('Failed to apply. Please try again.', { type: 'error' });
        } finally {
            setApplyingTo(null);
        }
    };

    const handleApply = (internshipId) => {
        setApplyingTo(internshipId);

        if (hasSavedResume) {
            setResumeModalJobId(internshipId);
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

    return (
        <div className={styles.page}>
            <DashboardNav userName={userName} userEmail={user.email} userType="Job Seeker" />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Available Internships</h1>
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
                            Loading internships...
                        </div>
                    )}

                    {error && (
                        <div className={`${styles.stateBlock} ${styles.stateError}`}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && filteredInternships.length === 0 && (
                        <div className={`${styles.stateBlock} ${styles.stateMuted}`}>
                            No internships found matching your criteria.
                        </div>
                    )}

                    {!loading && !error && filteredInternships.length > 0 && (
                        <div className={styles.jobsGrid}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".pdf"
                                style={{ display: 'none' }}
                                onChange={handleFileSelected}
                            />
                            {filteredInternships.map(internship => (
                                <JobListCard
                                    key={internship.id}
                                    job={internship}
                                    type="internship"
                                    applied={appliedInternships.has(internship.id)}
                                    onApply={() => handleApply(internship.id)}
                                    onSave={() => handleSaveInternship(internship)}
                                    onRemove={() => handleRemoveSavedInternship(internship.id)}
                                    isSaved={isSaved('INTERNSHIP', internship.id)}
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
                                    <strong>Upload different resume</strong> to choose another PDF just for this internship.
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

export default InternshipsPage;
