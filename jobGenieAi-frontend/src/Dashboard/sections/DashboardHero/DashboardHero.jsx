import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardHero.module.css';

const DashboardHero = () => {
    const navigate = useNavigate();

    return (
        <section className={styles.heroSection}>
            <div className={styles.container}>
                <div className={styles.badge}>
                    <span className={styles.badgeIcon}>💡</span>
                    Practice. Improve. Crack It.
                </div>

                <h1 className={styles.title}>
                    Ace Your Next Interview with<br />
                    <span className={styles.highlight}>AI-Powered Practice</span>
                </h1>

                <p className={styles.subtitle}>
                    Prepare for any job interview with personalized AI feedback, realistic mock
                    interviews, and expert curated questions tailored to your industry.
                </p>

                <div className={styles.ctas}>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => navigate('/mock-test')}
                    >
                        Start Practicing Free
                    </button>
                </div>

                <div className={styles.trust}>
                    <div className={styles.avatars}>
                        <div className={styles.avatar} style={{ background: '#4f46e5' }}>J</div>
                        <div className={styles.avatar} style={{ background: '#06b6d4' }}>A</div>
                        <div className={styles.avatar} style={{ background: '#8b5cf6' }}>M</div>
                        <div className={styles.avatar} style={{ background: '#f59e0b' }}>S</div>
                    </div>
                    <p className={styles.trustText}>Trusted by 100+ job seekers</p>
                </div>
            </div>
        </section>
    );
};

export default DashboardHero;
