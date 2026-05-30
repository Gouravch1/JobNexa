import React from 'react';
import JobCard from '../../../components/JobCard/JobCard';
import { getSavedJobs, removeJob } from '../../../services/savedJobsService';
import styles from './SavedJobsSection.module.css';

const SavedJobsSection = () => {
    const savedJobs = getSavedJobs();

    const handleApply = () => {
        // Navigate via jobs/internships pages; here we just show saved list
    };

    const handleRemove = (kind, jobId) => {
        removeJob(kind, jobId);
        window.location.reload();
    };

    if (savedJobs.length === 0) {
        return (
            <section id="saved-jobs" className={styles.section}>
                <div className={styles.container}>
                    <h2 className={styles.title}>Your Saved Jobs</h2>
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                            </svg>
                        </div>
                        <h3 className={styles.emptyTitle}>No Saved Jobs Yet</h3>
                        <p className={styles.emptyText}>
                            Start saving jobs you're interested in to keep track of opportunities
                        </p>
                        <button className={styles.browseButton}>Browse Jobs</button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="saved-jobs" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Your Saved Jobs</h2>
                    <span className={styles.count}>{savedJobs.length} saved</span>
                </div>

                <div className={styles.grid}>
                    {savedJobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onApply={handleApply}
                            onRemove={() => handleRemove(job.kind, job.id)}
                            isSaved={true}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SavedJobsSection;
