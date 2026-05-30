import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCard from '../../../components/JobCard/JobCard';
import jobService from '../../../services/jobService';
import { getSavedJobs, isSaved, saveJob, removeJob } from '../../../services/savedJobsService';
import styles from './JobsSection.module.css';

const JobsSection = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [savedSnapshot, setSavedSnapshot] = useState(() => getSavedJobs());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadJobs = async () => {
            try {
                setLoading(true);
                const data = await jobService.getAllJobs();
                const mapped = (data || []).slice(0, 4).map((job) => ({
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    location: job.location || 'Location not specified',
                    salary: job.salaryRange || '—',
                    type: job.type === 'INTERNSHIP' ? 'Internship' : 'Job',
                    mode: 'Office-Only',
                    experience: job.experience || '',
                    logo: null,
                }));
                setJobs(mapped);
                setError(null);
            } catch (e) {
                console.error('Error loading jobs for dashboard:', e);
                setError('Failed to load jobs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, []);

    const handleApply = (jobId) => {
        navigate(`/job/${jobId}`);
    };

    const handleSave = (job) => {
        saveJob({ ...job, kind: 'JOB' });
        setSavedSnapshot(getSavedJobs());
    };

    const handleRemove = (jobId) => {
        removeJob('JOB', jobId);
        setSavedSnapshot(getSavedJobs());
    };

    return (
        <section id="jobs" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Latest Jobs</h2>
                        <p className={styles.subtitle}>Recently posted roles you can apply to now</p>
                    </div>
                    <button
                        className={styles.viewAllButton}
                        type="button"
                        onClick={() => navigate('/jobs')}
                    >
                        View All Jobs
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {loading && !error && (
                    <div className={styles.loading}>Loading latest jobs...</div>
                )}

                {error && !loading && (
                    <div className={styles.loading}>{error}</div>
                )}

                {!loading && !error && (
                    <div className={styles.grid}>
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onApply={handleApply}
                                onSave={() => handleSave(job)}
                                onRemove={handleRemove}
                                isSaved={isSaved('JOB', job.id)}
                            />
                        ))}
                        {jobs.length === 0 && (
                            <div className={styles.emptyText}>
                                No jobs are available right now. Check back soon or browse all jobs.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default JobsSection;
