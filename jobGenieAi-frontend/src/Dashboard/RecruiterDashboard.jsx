import React, { useEffect, useState } from 'react';
import DashboardNav from '../components/DashboardNav/DashboardNav';
import RecruiterHero from './sections/RecruiterHero/RecruiterHero';
import PostedJobsSection from './sections/PostedJobsSection/PostedJobsSection';
import DashboardFooter from './sections/DashboardFooter/DashboardFooter';
import styles from './RecruiterDashboard.module.css';
import jobService from '../services/jobService';
import applicationService from '../services/applicationService';

const RecruiterDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.email?.split('@')[0] || 'Recruiter';

    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplicants: 0,
        hired: 0,
    });
    const [recentJobs, setRecentJobs] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            let recruiterJobs = [];

            try {
                recruiterJobs = await jobService.getRecruiterJobs();
            } catch (e) {
                console.error('Error fetching recruiter jobs:', e);
            }

            if (!isMounted) return;

            // Fetch per-job applicant counts in parallel
            const jobsWithData = await Promise.all(
                (recruiterJobs || []).map(async (job) => {
                    const jobId = job.job_post_id ?? job.id;
                    const title = job.job_title ?? job.title;
                    const location =
                        job.jobLocation &&
                        (job.jobLocation.city || job.jobLocation.state || job.jobLocation.country)
                            ? [job.jobLocation.city, job.jobLocation.state, job.jobLocation.country]
                                  .filter(Boolean)
                                  .join(', ')
                            : job.location || 'Location not specified';

                    let count = 0;
                    try {
                        const apps = await applicationService.getJobApplications(jobId);
                        count = (apps || []).length;
                    } catch {
                        count = 0;
                    }

                    return { id: jobId, title, location, totalCandidates: count };
                })
            );

            if (!isMounted) return;

            const totalApplicants = jobsWithData.reduce((sum, j) => sum + j.totalCandidates, 0);

            setStats({
                activeJobs: jobsWithData.length,
                totalApplicants,
                hired: 0,
            });
            setRecentJobs(jobsWithData.slice(0, 5));
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [user.userId]);

    return (
        <div className={styles.dashboard}>
            <DashboardNav userName={userName} userEmail={user.email} userType="Recruiter" />

            <main className={styles.main}>
                <RecruiterHero stats={stats} />
                <PostedJobsSection jobs={recentJobs} />
            </main>

            <DashboardFooter />
        </div>
    );
};

export default RecruiterDashboard;
