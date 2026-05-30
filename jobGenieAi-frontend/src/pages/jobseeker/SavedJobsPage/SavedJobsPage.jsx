import React, { useEffect, useMemo, useState } from 'react';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import JobListCard from '../../../components/JobListCard/JobListCard';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import jobService from '../../../services/jobService';
import styles from './SavedJobsPage.module.css';
import { getSavedJobs, isSaved, removeJob } from '../../../services/savedJobsService';

const SavedJobsPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.email?.split('@')[0] || 'User';

    const rawSaved = useMemo(() => getSavedJobs(), []);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleRemoveSaved = (kind, id) => {
        removeJob(kind, id);
        setCards((prev) => prev.filter((c) => !(c.kind === kind && c.id === id)));
    };

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [jobs, internships] = await Promise.all([
                    jobService.getAllJobs().catch(() => []),
                    jobService.getAllInternships().catch(() => []),
                ]);

                const jobById = new Map((jobs || []).map((j) => [j.id, j]));
                const internshipById = new Map((internships || []).map((j) => [j.id, j]));

                const mapped = (rawSaved || []).map((item) => {
                    const kind = (item.kind || 'JOB').toUpperCase();
                    const source =
                        kind === 'INTERNSHIP' ? internshipById.get(item.id) : jobById.get(item.id);

                    // fall back to saved snapshot if backend list doesn't contain it
                    const title = source?.title ?? item.title ?? '';
                    const company = source?.company ?? item.company ?? 'Company';
                    const skills = source?.skills ?? '';
                    const location = source?.location ?? item.location ?? 'Location not specified';
                    const createdAt = source?.createdAt ?? null;

                    return {
                        id: item.id,
                        kind,
                        title,
                        company,
                        description: source?.description ?? 'Saved job',
                        type: kind === 'INTERNSHIP' ? 'INTERNSHIP' : (source?.type ?? 'JOB'),
                        level: source?.experience ?? '',
                        category: 'Technology',
                        location,
                        posted: createdAt ? new Date(createdAt).toLocaleDateString() : '',
                        badge: (company || 'SV').substring(0, 2).toUpperCase(),
                        skills,
                        salary: source?.salaryRange ?? item.salary ?? '',
                    };
                });

                setCards(mapped);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [rawSaved]);

    return (
        <div className={styles.page}>
            <DashboardNav userName={userName} userEmail={user.email} userType="Job Seeker" />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Saved Jobs</h1>
                        </div>
                        <div className={styles.count}>{cards.length} Jobs Saved</div>
                    </div>

                    {loading ? (
                        <div className={styles.emptyText} style={{ textAlign: 'center' }}>
                            Loading saved jobs...
                        </div>
                    ) : cards.length > 0 ? (
                        <div className={styles.jobsGrid}>
                            {cards.map(job => (
                                <JobListCard
                                    key={`${job.id}-${job.kind}`}
                                    job={job}
                                    type={job.kind === 'INTERNSHIP' ? 'internship' : 'job'}
                                    onRemove={() => handleRemoveSaved(job.kind, job.id)}
                                    isSaved={isSaved(job.kind, job.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>🔖</div>
                            <h3 className={styles.emptyTitle}>No Saved Jobs</h3>
                        </div>
                    )}
                </div>
            </main>

            <DashboardFooter />
        </div>
    );
};

export default SavedJobsPage;
