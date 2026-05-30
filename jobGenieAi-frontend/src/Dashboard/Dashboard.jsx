import React, { useEffect, useMemo, useState } from 'react';
import DashboardNav from '../components/DashboardNav/DashboardNav';
import DashboardHero from './sections/DashboardHero/DashboardHero';
import JobsSection from './sections/JobsSection/JobsSection';
import InternshipsSection from './sections/InternshipsSection/InternshipsSection';
import SavedJobsSection from './sections/SavedJobsSection/SavedJobsSection';
import DashboardFooter from './sections/DashboardFooter/DashboardFooter';
import styles from './Dashboard.module.css';
import applicationService from '../services/applicationService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const userName = useMemo(() => {
        if (profile?.fullName) return profile.fullName;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    }, [profile, user]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const [apps, me] = await Promise.all([
                    applicationService.getUserApplications(),
                    userService.getCurrentProfile().catch(() => null),
                ]);

                if (!isMounted) return;
                setApplications(apps || []);
                setProfile(me);
            } catch (e) {
                if (!isMounted) return;
                console.error('Error loading dashboard data:', e);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className={styles.dashboard}>
            <DashboardNav userName={userName} userEmail={user?.email} userType="Job Seeker" />

            <main className={styles.main}>
                <DashboardHero />
                <JobsSection />
                <InternshipsSection />
                <SavedJobsSection />
            </main>

            <DashboardFooter />
        </div>
    );
};

export default Dashboard;
