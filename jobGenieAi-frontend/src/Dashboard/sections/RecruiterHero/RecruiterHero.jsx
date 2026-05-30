import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RecruiterHero.module.css';

const RecruiterHero = ({ stats }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const firstName = user.email?.split('@')[0] || 'Recruiter';

    return (
        <section className={styles.heroSection}>
            <div className={styles.container}>
                <div className={styles.badge}>
                    <span className={styles.badgeIcon}>👋</span>
                    Welcome Back, {firstName}!
                </div>

                <h1 className={styles.title}>
                    Find the <span className={styles.highlight}>Perfect Candidates</span>
                    <br />for Your Team
                </h1>

                <p className={styles.subtitle}>
                    Manage your job postings, review applications, and hire top talent all in one place.
                    Connect with skilled professionals ready to join your team.
                </p>

                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📝</div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{stats?.activeJobs ?? 0}</div>
                            <div className={styles.statLabel}>Active Jobs</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>👥</div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{stats?.totalApplicants ?? 0}</div>
                            <div className={styles.statLabel}>Total Applicants</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>✅</div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{stats?.hired ?? 0}</div>
                            <div className={styles.statLabel}>Hired</div>
                        </div>
                    </div>
                </div>

                <div className={styles.ctas}>
                    <button className={styles.primaryButton} onClick={() => navigate('/recruiter/post-job')}>
                        ➕ Post New Job
                    </button>
                    <button className={styles.secondaryButton} onClick={() => navigate('/recruiter/applicants')}>
                        👁️ View All Applicants
                    </button>
                </div>
            </div>
        </section>
    );
};

export default RecruiterHero;
