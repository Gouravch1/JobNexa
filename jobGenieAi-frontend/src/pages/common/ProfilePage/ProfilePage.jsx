import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import styles from './ProfilePage.module.css';
import userService from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const userName = user?.email?.split('@')[0] || 'User';
    const isRecruiter = user?.userType === 'Recruiter';

    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        fullName: userName,
        email: user?.email || '',
        phone: '',
        location: '',
        bio: '',
        skills: '',
        experience: '',
        education: '',
        resumeUrl: '',
    });

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                const me = await userService.getCurrentProfile();
                if (!isMounted || !me) return;
                setProfile((prev) => ({
                    ...prev,
                    fullName: me.fullName || me.name || prev.fullName,
                    email: me.email || prev.email,
                    phone: me.phone || '',
                    location: me.location || '',
                    bio: me.bio || '',
                    skills: me.skills || '',
                    experience: me.experience || '',
                    education: me.education || '',
                    resumeUrl: me.resumeUrl || '',
                }));
            } catch (e) {
                console.error('Error loading profile:', e);
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
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const updated = await userService.updateProfile(profile);
            if (updated) {
                setProfile((prev) => ({
                    ...prev,
                    fullName: updated.fullName || prev.fullName,
                    phone: updated.phone ?? prev.phone,
                    location: updated.location ?? prev.location,
                    bio: updated.bio ?? prev.bio,
                    skills: updated.skills ?? prev.skills,
                    experience: updated.experience ?? prev.experience,
                    education: updated.education ?? prev.education,
                    resumeUrl: updated.resumeUrl ?? prev.resumeUrl,
                }));
            }
            setIsEditing(false);
            showNotification('Profile saved successfully.', { type: 'success' });
        } catch (e) {
            console.error('Error saving profile:', e);
            showNotification('Failed to save profile. Please try again.', { type: 'error' });
        }
    };

    const handleResumeUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const result = await userService.uploadResume(file);
            setProfile((prev) => ({
                ...prev,
                resumeUrl: result.resumeUrl || prev.resumeUrl,
            }));
            showNotification('Resume uploaded successfully.', { type: 'success' });
        } catch (e) {
            console.error('Error uploading resume:', e);
            showNotification('Failed to upload resume. Please try again.', { type: 'error' });
        }
    };

    return (
        <div className={styles.page}>
            <DashboardNav
                userName={userName}
                userEmail={user?.email}
                userType={user?.userType}
            />

            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>My Profile</h1>
                            <p className={styles.subtitle}>Manage your personal information</p>
                        </div>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                                ✏️ Edit Profile
                            </button>
                        ) : (
                            <div className={styles.actions}>
                                <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>
                                    Cancel
                                </button>
                                <button onClick={handleSave} className={styles.saveButton}>
                                    💾 Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Card */}
                    <div className={styles.profileCard}>
                        <div className={styles.avatar}>
                            <div className={styles.avatarPlaceholder}>
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            {isEditing && (
                                <label className={styles.uploadButton}>
                                    📄 Upload Resume
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        style={{ display: 'none' }}
                                        onChange={handleResumeUpload}
                                    />
                                </label>
                            )}
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={profile.fullName}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                ) : (
                                    <p className={styles.value}>{profile.fullName}</p>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email</label>
                                <p className={styles.value}>{profile.email}</p>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Phone</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="+91 1234567890"
                                    />
                                ) : (
                                    <p className={styles.value}>{profile.phone || 'Not provided'}</p>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Location</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="location"
                                        value={profile.location}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="City, Country"
                                    />
                                ) : (
                                    <p className={styles.value}>{profile.location || 'Not provided'}</p>
                                )}
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Bio</label>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        value={profile.bio}
                                        onChange={handleChange}
                                        className={styles.textarea}
                                        rows="4"
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className={styles.value}>{profile.bio || 'No bio added yet'}</p>
                                )}
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Default Resume</label>
                                {profile.resumeUrl ? (
                                    <a
                                        href={profile.resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.value}
                                    >
                                        View Resume
                                    </a>
                                ) : (
                                    <p className={styles.value}>No resume uploaded yet</p>
                                )}
                            </div>

                            {!isRecruiter && (
                                <>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Skills</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="skills"
                                                value={profile.skills}
                                                onChange={handleChange}
                                                className={styles.input}
                                                placeholder="JavaScript, React, Node.js..."
                                            />
                                        ) : (
                                            <p className={styles.value}>{profile.skills || 'No skills added'}</p>
                                        )}
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label className={styles.label}>Experience</label>
                                        {isEditing ? (
                                            <textarea
                                                name="experience"
                                                value={profile.experience}
                                                onChange={handleChange}
                                                className={styles.textarea}
                                                rows="3"
                                                placeholder="Your work experience..."
                                            />
                                        ) : (
                                            <p className={styles.value}>{profile.experience || 'No experience added'}</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <DashboardFooter />
        </div>
    );
};

export default ProfilePage;
