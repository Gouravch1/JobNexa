import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCard from '../../../components/JobCard/JobCard';
import jobService from '../../../services/jobService';
import { getSavedJobs, isSaved, saveJob, removeJob } from '../../../services/savedJobsService';
import styles from './InternshipsSection.module.css';

const InternshipsSection = () => {
    const navigate = useNavigate();
    const [internships, setInternships] = useState([]);
    const [savedSnapshot, setSavedSnapshot] = useState(() => getSavedJobs());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadInternships = async () => {
            try {
                setLoading(true);
                const data = await jobService.getAllInternships();
                const mapped = (data || []).slice(0, 4).map((job) => ({
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    location: job.location || 'Location not specified',
                    duration: '',
                    salary: job.salaryRange || '—',
                    type: 'Internship',
                    mode: 'On-site',
                    experience: job.experience || 'Entry Level',
                    logo: null,
                }));
                setInternships(mapped);
                setError(null);
            } catch (e) {
                console.error('Error loading internships for dashboard:', e);
                setError('Failed to load internships. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadInternships();
    }, []);

    const handleApply = (internshipId) => {
        navigate(`/internship/${internshipId}`);
    };

    const handleSave = (internship) => {
        saveJob({ ...internship, kind: 'INTERNSHIP' });
        setSavedSnapshot(getSavedJobs());
    };

    const handleRemove = (internshipId) => {
        removeJob('INTERNSHIP', internshipId);
        setSavedSnapshot(getSavedJobs());
    };

    return (
        <section id="internships" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Internship Opportunities</h2>
                        <p className={styles.subtitle}>Start your career journey with top companies</p>
                    </div>
                    <button
                        className={styles.viewAllButton}
                        type="button"
                        onClick={() => navigate('/internships')}
                    >
                        View All Internships
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {loading && !error && (
                    <div className={styles.loading}>Loading internships...</div>
                )}

                {error && !loading && (
                    <div className={styles.loading}>{error}</div>
                )}

                {!loading && !error && (
                    <div className={styles.grid}>
                        {internships.map((internship) => (
                            <JobCard
                                key={internship.id}
                                job={internship}
                                onApply={handleApply}
                                onSave={() => handleSave(internship)}
                                onRemove={handleRemove}
                                isSaved={isSaved('INTERNSHIP', internship.id)}
                                type="internship"
                            />
                        ))}
                        {internships.length === 0 && (
                            <div className={styles.emptyText}>
                                No internships are available right now. Check back soon or browse all internships.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default InternshipsSection;
