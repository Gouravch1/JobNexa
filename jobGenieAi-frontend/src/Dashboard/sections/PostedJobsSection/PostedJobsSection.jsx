import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PostedJobsSection.module.css';

const PostedJobsSection = ({ jobs = [] }) => {
    const navigate = useNavigate();

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Your Posted Jobs</h2>
                        <p className={styles.subtitle}>Manage and track all your job postings</p>
                    </div>
                    <button className={styles.postButton} onClick={() => navigate('/recruiter/post-job')}>
                        ➕ Post New Job
                    </button>
                </div>

                {jobs.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📝</div>
                        <h3 className={styles.emptyTitle}>No Jobs Posted Yet</h3>
                        <p className={styles.emptyText}>
                            Start by posting your first job to attract talented candidates
                        </p>
                        <button className={styles.emptyButton} onClick={() => navigate('/recruiter/post-job')}>
                            Post Your First Job
                        </button>
                    </div>
                ) : (
                    <div className={styles.jobsGrid}>
                        {jobs.map((job) => (
                            <div key={job.id} className={styles.jobCard} onClick={() => navigate(`/recruiter/applicants?jobId=${job.id}`)}>
                                <div className={styles.jobTitle}>{job.title}</div>
                                <div className={styles.jobMeta}>
                                    <span>{job.location}</span>
                                    <span>{job.totalCandidates} applicants</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PostedJobsSection;
