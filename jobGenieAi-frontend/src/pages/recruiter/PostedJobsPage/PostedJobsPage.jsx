import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import jobService from '../../../services/jobService';
import applicationService from '../../../services/applicationService';
import adminService from '../../../services/adminService';
import { useNotification } from '../../../context/NotificationContext';
import styles from './PostedJobsPage.module.css';

const PostedJobsPage = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.email?.split('@')[0] || 'User';

    const [filter, setFilter] = useState('all'); // all, active, closed
    const [postedJobs, setPostedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostedJobs = async () => {
            if (!user.userId) {
                setError('User not logged in');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await jobService.getRecruiterJobs();

                const transformedJobs = data.map(job => ({
                    id: job.id,
                    title: job.title,
                    location: job.location || 'Location not specified',
                    type: job.type === 'INTERNSHIP' ? 'Internship' : 'Full-time',
                    posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '',
                    applicants: 0,
                    status: 'active'
                }));

                // Preload applicant counts for all jobs
                const counts = await Promise.all(
                    transformedJobs.map(async (job) => {
                        try {
                            const apps = await applicationService.getJobApplications(job.id);
                            return { id: job.id, count: (apps || []).length };
                        } catch {
                            return { id: job.id, count: 0 };
                        }
                    })
                );

                const jobsWithCounts = transformedJobs.map(job => {
                    const match = counts.find(c => c.id === job.id);
                    return {
                        ...job,
                        applicants: match ? match.count : 0,
                    };
                });

                setPostedJobs(jobsWithCounts);
                setError(null);
            } catch (err) {
                console.error('Error fetching posted jobs:', err);
                setError('Failed to load posted jobs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPostedJobs();
    }, [user.userId]);

    const filteredJobs = postedJobs.filter(job => {
        if (filter === 'all') return true;
        return job.status === filter;
    });

    const handleEdit = (jobId) => {
        navigate(`/recruiter/edit-job/${jobId}`);
    };

    const openApplicantsPage = (jobId) => {
        navigate(`/recruiter/applicants?jobId=${jobId}`);
    };

    const handleClose = async (jobId) => {
        if (window.confirm('Are you sure you want to close this job posting?')) {
            try {
                const result = await jobService.deleteJob(jobId);
                    if (result.success) {
                    // Update the job status in the local state
                    setPostedJobs(postedJobs.map(job =>
                        job.id === jobId ? { ...job, status: 'closed' } : job
                    ));
                    showNotification('Job closed successfully.', { type: 'success' });
                } else {
                    showNotification(result.message || 'Failed to close job.', { type: 'error' });
                }
            } catch (error) {
                console.error('Error closing job:', error);
                showNotification('Failed to close job. Please try again.', { type: 'error' });
            }
        }
    };

    const handleUpdateStatus = async (applicationId, status, jobId) => {
        try {
            await adminService.updateApplicationStatus(applicationId, status);
            setJobApplicants(prev => {
                const list = prev[jobId] || [];
                const updated = list.map(app =>
                    app.id === applicationId ? { ...app, status } : app
                );
                return { ...prev, [jobId]: updated };
            });
        } catch (e) {
            console.error('Error updating application status:', e);
            showNotification('Failed to update candidate status.', { type: 'error' });
        }
    };

    return (
        <div className={styles.page}>
            <DashboardNav userName={userName} userEmail={user.email} userType="Recruiter" />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Posted Jobs</h1>
                            <p className={styles.subtitle}>Manage your job postings</p>
                        </div>
                        <button onClick={() => navigate('/recruiter/post-job')} className={styles.postButton}>
                            + Post New Job
                        </button>
                    </div>

                    {/* Filters */}
                    <div className={styles.filters}>
                        <button
                            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All ({postedJobs.length})
                        </button>
                        <button
                            className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Active ({postedJobs.filter(j => j.status === 'active').length})
                        </button>
                        <button
                            className={`${styles.filterButton} ${filter === 'closed' ? styles.active : ''}`}
                            onClick={() => setFilter('closed')}
                        >
                            Closed ({postedJobs.filter(j => j.status === 'closed').length})
                        </button>
                    </div>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            Loading posted jobs...
                        </div>
                    )}

                    {error && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && filteredJobs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            {filter === 'all' ? 'No jobs posted yet.' : `No ${filter} jobs.`}
                        </div>
                    )}

                    {/* Jobs Table */}
                    {!loading && !error && filteredJobs.length > 0 && (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Job Title</th>
                                        <th>Location</th>
                                        <th>Type</th>
                                        <th>Posted</th>
                                        <th>Applicants</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJobs.map(job => (
                                        <React.Fragment key={job.id}>
                                            <tr
                                                className={styles.jobRow}
                                                onClick={() => openApplicantsPage(job.id)}
                                            >
                                                <td className={styles.jobTitle}>{job.title}</td>
                                                <td>{job.location}</td>
                                                <td>
                                                    <span className={styles.typeBadge}>{job.type}</span>
                                                </td>
                                                <td className={styles.posted}>{job.posted}</td>
                                                <td>
                                                    <span className={styles.applicantsCount}>{job.applicants}</span>
                                                </td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${styles[job.status]}`}>
                                                        {job.status === 'active' ? '● Active' : '● Closed'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(job.id);
                                                            }}
                                                            className={styles.actionButton}
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                        {job.status === 'active' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleClose(job.id);
                                                                }}
                                                                className={styles.actionButton}
                                                                title="Close Job"
                                                            >
                                                                🔒
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <DashboardFooter />
        </div>
    );
};

export default PostedJobsPage;
