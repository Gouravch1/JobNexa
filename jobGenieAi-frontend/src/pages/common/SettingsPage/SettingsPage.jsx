import React, { useEffect, useState } from 'react';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import styles from './SettingsPage.module.css';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import userService from '../../../services/userService';

const SettingsPage = () => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const userName = user?.email?.split('@')[0] || 'User';
    const userType = user?.userType || localStorage.getItem('userType') || 'Job Seeker';

    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        // Account Settings
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',

        // Notification Settings
        emailNotifications: true,
        jobAlerts: true,
        applicationUpdates: true,
        weeklyNewsletter: false,

        // Privacy Settings
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,

        // Preferences
        language: 'en',
        timezone: 'Asia/Kolkata'
    });

    useEffect(() => {
        let isMounted = true;

        const loadSettings = async () => {
            try {
                const data = await userService.getSettings();
                if (!isMounted || !data) return;
                setSettings((prev) => ({
                    ...prev,
                    email: data.email || prev.email,
                    emailNotifications: data.emailNotifications ?? prev.emailNotifications,
                    jobAlerts: data.jobAlerts ?? prev.jobAlerts,
                    applicationUpdates: data.applicationUpdates ?? prev.applicationUpdates,
                    weeklyNewsletter: data.weeklyNewsletter ?? prev.weeklyNewsletter,
                    profileVisibility: data.profileVisibility || prev.profileVisibility,
                    showEmail: data.showEmail ?? prev.showEmail,
                    showPhone: data.showPhone ?? prev.showPhone,
                    language: data.language || prev.language,
                    timezone: data.timezone || prev.timezone,
                }));
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        };

        loadSettings();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleChange = (field, value) => {
        setSettings({ ...settings, [field]: value });
    };

    const handleSave = async () => {
        if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
            showNotification('New password and confirmation do not match.', { type: 'error' });
            return;
        }

        try {
            setSaving(true);
            const updated = await userService.updateSettings(settings);

            if (updated?.email && user) {
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                stored.email = updated.email;
                localStorage.setItem('user', JSON.stringify(stored));
            }

            setSettings((prev) => ({
                ...prev,
                ...updated,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }));

            showNotification('Settings saved successfully!', { type: 'success' });
        } catch (e) {
            showNotification(e.message || 'Failed to save settings. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.page}>
            <DashboardNav userName={userName} userEmail={user.email} userType={userType} />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Settings</h1>
                        <p className={styles.subtitle}>Manage your account settings and preferences</p>
                    </div>

                    <div className={styles.content}>
                        {/* Account Settings */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Account Settings</h2>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    value={settings.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Current Password</label>
                                <input
                                    type="password"
                                    value={settings.currentPassword}
                                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                                    className={styles.input}
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>New Password</label>
                                    <input
                                        type="password"
                                        value={settings.newPassword}
                                        onChange={(e) => handleChange('newPassword', e.target.value)}
                                        className={styles.input}
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={settings.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                        className={styles.input}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Notification Settings */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Notifications</h2>

                            <div className={styles.toggleGroup}>
                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3 className={styles.toggleTitle}>Email Notifications</h3>
                                        <p className={styles.toggleDesc}>Receive email notifications for important updates</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={settings.emailNotifications}
                                            onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3 className={styles.toggleTitle}>Job Alerts</h3>
                                        <p className={styles.toggleDesc}>Get notified about new jobs matching your profile</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={settings.jobAlerts}
                                            onChange={(e) => handleChange('jobAlerts', e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3 className={styles.toggleTitle}>Application Updates</h3>
                                        <p className={styles.toggleDesc}>Updates about your job applications</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={settings.applicationUpdates}
                                            onChange={(e) => handleChange('applicationUpdates', e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3 className={styles.toggleTitle}>Weekly Newsletter</h3>
                                        <p className={styles.toggleDesc}>Receive weekly career tips and insights</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={settings.weeklyNewsletter}
                                            onChange={(e) => handleChange('weeklyNewsletter', e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Privacy Settings */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Privacy</h2>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Profile Visibility</label>
                                <select
                                    value={settings.profileVisibility}
                                    onChange={(e) => handleChange('profileVisibility', e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="connections">Connections Only</option>
                                </select>
                            </div>

                            <div className={styles.toggleGroup}>
                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3 className={styles.toggleTitle}>Show Email Address</h3>
                                        <p className={styles.toggleDesc}>Display email on your public profile</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={settings.showEmail}
                                            onChange={(e) => handleChange('showEmail', e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3 className={styles.toggleTitle}>Show Phone Number</h3>
                                        <p className={styles.toggleDesc}>Display phone number on your public profile</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={settings.showPhone}
                                            onChange={(e) => handleChange('showPhone', e.target.checked)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Save Button */}
                        <div className={styles.actions}>
                            <button onClick={handleSave} className={styles.saveButton} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <DashboardFooter />
        </div>
    );
};

export default SettingsPage;
