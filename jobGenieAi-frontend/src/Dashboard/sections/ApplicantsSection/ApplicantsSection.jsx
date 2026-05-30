import React from 'react';
import styles from './ApplicantsSection.module.css';

const ApplicantsSection = ({ applicants = [] }) => {

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Recent Applicants</h2>
                        <p className={styles.subtitle}>Latest applications for your job postings</p>
                    </div>
                    <button className={styles.viewAllButton}>
                        View All Applicants →
                    </button>
                </div>

                {applicants.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>👥</div>
                        <h3 className={styles.emptyTitle}>No Applicants Yet</h3>
                        <p className={styles.emptyText}>
                            Once candidates apply to your jobs, you'll see them here
                        </p>
                    </div>
                ) : (
                    <div className={styles.applicantsList}>
                        {applicants.map((applicant) => (
                            <div key={applicant.id} className={styles.applicantItem}>
                                <div className={styles.applicantInfo}>
                                    <div className={styles.applicantAvatar}>
                                        {applicant.userName?.charAt(0) || applicant.name?.charAt(0) || 'A'}
                                    </div>
                                    <div>
                                        <div className={styles.applicantName}>
                                            {applicant.userName || applicant.name}
                                        </div>
                                        <div className={styles.applicantMeta}>
                                            {applicant.jobTitle} • {applicant.company}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.applicantScores}>
                                    {typeof applicant.resumeScore === 'number' && (
                                        <span className={styles.scoreBadge}>
                                            Resume {applicant.resumeScore.toFixed(0)}%
                                        </span>
                                    )}
                                    {typeof applicant.interviewScore === 'number' && (
                                        <span className={styles.scoreBadge}>
                                            Interview {applicant.interviewScore.toFixed(0)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ApplicantsSection;
