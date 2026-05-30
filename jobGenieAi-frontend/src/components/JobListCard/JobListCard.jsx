import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JobListCard.module.css';

const JobCard = ({
    job,
    type = 'job',
    applied = false,
    onApply,
    onSave,
    onRemove,
    isSaved = false,
}) => {
    const navigate = useNavigate();
    const [saved, setSaved] = useState(isSaved);

    const handleCardClick = () => {
        navigate(`/${type}/${job.id}`);
    };

    const handleSaveToggle = (event) => {
        event.stopPropagation();
        if (saved && onRemove) {
            onRemove();
        } else if (!saved && onSave) {
            onSave();
        }
        setSaved(!saved);
    };

    return (
        <div className={styles.jobCard} onClick={handleCardClick}>
            <div className={styles.cardHeader}>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                {(onSave || onRemove) && (
                    <button
                        type="button"
                        className={`${styles.saveButton} ${saved ? styles.saveButtonSaved : ''}`}
                        onClick={handleSaveToggle}
                        aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill={saved ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                    </button>
                )}
            </div>

            <p className={styles.company}>{job.company}</p>

            {job.skills && (
                <p className={styles.skills}>
                    <span className={styles.skillsLabel}>Skills:</span> {job.skills}
                </p>
            )}

            <div className={styles.tags}>
                <span className={styles.tag}>{job.type}</span>
                <span className={styles.tag}>{job.level}</span>
                <span className={styles.tag}>{job.category}</span>
            </div>

            <div className={styles.footer}>
                <span className={styles.location}>{job.location}</span>
                <span className={styles.posted}>Posted: {job.posted}</span>
                {onApply && (
                    <button
                        type="button"
                        className={styles.applyButton}
                        onClick={(event) => {
                            event.stopPropagation();
                            onApply();
                        }}
                        disabled={applied}
                    >
                        {applied ? 'Applied' : 'Apply'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default JobCard;
