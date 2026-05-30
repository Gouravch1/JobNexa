import React, { useState } from 'react';
import styles from './JobCard.module.css';

const JobCard = ({
    job,
    onApply,
    onSave,
    onRemove,
    isSaved = false,
    type = 'job' // 'job' or 'internship'
}) => {
    const [saved, setSaved] = useState(isSaved);

    const handleSaveToggle = () => {
        if (saved && onRemove) {
            onRemove(job.id);
        } else if (!saved && onSave) {
            onSave(job.id);
        }
        setSaved(!saved);
    };

    const handleApply = () => {
        if (onApply) {
            onApply(job.id);
        }
    };

    return (
        <div className={styles.card}>
            {/* Company Logo */}
            <div className={styles.logoContainer}>
                {job.logo ? (
                    <img src={job.logo} alt={job.company} className={styles.logo} />
                ) : (
                    <div className={styles.logoPlaceholder}>
                        {job.company.charAt(0)}
                    </div>
                )}
            </div>

            {/* Job Details */}
            <div className={styles.content}>
                <h3 className={styles.title}>{job.title}</h3>
                <p className={styles.company}>{job.company}</p>

                <div className={styles.meta}>
                    <span className={styles.metaItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        {job.location}
                    </span>
                    {job.salary && (
                        <span className={styles.metaItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="2" x2="12" y2="22" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            {job.salary}
                        </span>
                    )}
                    {job.duration && (
                        <span className={styles.metaItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {job.duration}
                        </span>
                    )}
                </div>

                {/* Tags */}
                <div className={styles.tags}>
                    {job.type && <span className={styles.tag}>{job.type}</span>}
                    {job.mode && <span className={`${styles.tag} ${styles.tagHighlight}`}>{job.mode}</span>}
                    {job.experience && <span className={styles.tag}>{job.experience}</span>}
                </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button className={styles.applyButton} onClick={handleApply}>
                    Apply Now
                </button>
                <button
                    className={`${styles.saveButton} ${saved ? styles.saved : ''}`}
                    onClick={handleSaveToggle}
                    aria-label={saved ? 'Remove from saved' : 'Save job'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default JobCard;
