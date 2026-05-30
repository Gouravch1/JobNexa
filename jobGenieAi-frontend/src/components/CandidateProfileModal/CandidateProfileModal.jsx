import React, { useEffect, useState } from 'react';
import styles from './CandidateProfileModal.module.css';
import adminService from '../../services/adminService';

const BACKEND_URL = 'http://localhost:8080';

const getResumeUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const formatStatus = (status) => {
    const value = (status || 'PENDING').toUpperCase();
    if (value === 'APPROVED') return 'Accepted';
    if (value === 'REJECTED') return 'Rejected';
    return 'Pending';
};

const statusClass = (status) => {
    const value = (status || 'PENDING').toLowerCase();
    if (value === 'approved') return styles.statusApproved;
    if (value === 'rejected') return styles.statusRejected;
    return styles.statusPending;
};

const CandidateProfileModal = ({ isOpen, applicationId, onClose }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !applicationId) return;

        let isMounted = true;
        setLoading(true);
        setError(null);
        setProfile(null);

        const loadProfile = async () => {
            try {
                const data = await adminService.getCandidateProfile(applicationId);
                if (isMounted) {
                    setProfile(data);
                }
            } catch (e) {
                if (isMounted) {
                    setError(e.message || 'Failed to load candidate profile.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [isOpen, applicationId]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const resumeUrl = getResumeUrl(profile?.applicationResumeUrl || profile?.profileResumeUrl);
    const initial = profile?.name?.charAt(0)?.toUpperCase() || '?';

    return (
        <div className={styles.overlay} onClick={onClose} role="presentation">
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="candidate-profile-title"
            >
                <div className={styles.header}>
                    <div className={styles.headerMain}>
                        <div className={styles.avatar}>{initial}</div>
                        <div>
                            <h2 id="candidate-profile-title" className={styles.name}>
                                {profile?.name || 'Candidate Profile'}
                            </h2>
                            <p className={styles.subtitle}>
                                {profile
                                    ? `${profile.jobTitle || 'Role'}${profile.company ? ` · ${profile.company}` : ''}`
                                    : 'Loading application details...'}
                            </p>
                        </div>
                    </div>
                    <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>

                <div className={styles.body}>
                    {loading && <div className={styles.loading}>Loading profile...</div>}
                    {error && !loading && <div className={styles.error}>{error}</div>}

                    {profile && !loading && !error && (
                        <>
                            <div className={styles.scores}>
                                {typeof profile.resumeScore === 'number' && (
                                    <span className={styles.scoreBadge}>
                                        Resume {profile.resumeScore.toFixed(0)}%
                                    </span>
                                )}
                                {typeof profile.interviewScore === 'number' && (
                                    <span className={styles.scoreBadge}>
                                        Interview {profile.interviewScore.toFixed(0)}%
                                    </span>
                                )}
                                <span className={`${styles.statusBadge} ${statusClass(profile.status)}`}>
                                    {formatStatus(profile.status)}
                                </span>
                            </div>

                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Email</span>
                                    <span className={styles.detailValue}>{profile.email || '—'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Phone</span>
                                    <span className={styles.detailValue}>{profile.phone || 'Not provided'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Location</span>
                                    <span className={styles.detailValue}>{profile.location || 'Not provided'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Applied</span>
                                    <span className={styles.detailValue}>
                                        {profile.appliedAt
                                            ? new Date(profile.appliedAt).toLocaleDateString()
                                            : '—'}
                                    </span>
                                </div>
                            </div>

                            {profile.bio && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Bio</h3>
                                    <p className={styles.sectionText}>{profile.bio}</p>
                                </div>
                            )}

                            {profile.skills && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Skills</h3>
                                    <p className={styles.sectionText}>{profile.skills}</p>
                                </div>
                            )}

                            {profile.experience && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Experience</h3>
                                    <p className={styles.sectionText}>{profile.experience}</p>
                                </div>
                            )}

                            {profile.education && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Education</h3>
                                    <p className={styles.sectionText}>{profile.education}</p>
                                </div>
                            )}

                            {profile.feedback && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>AI Feedback</h3>
                                    <p className={styles.sectionText}>{profile.feedback}</p>
                                </div>
                            )}

                            {resumeUrl && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Resume</h3>
                                    <div className={styles.resumeActions}>
                                        <a
                                            href={resumeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.resumeLink}
                                        >
                                            View PDF
                                        </a>
                                        <a href={resumeUrl} download className={styles.resumeLink}>
                                            Download
                                        </a>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateProfileModal;
