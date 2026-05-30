import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardNav.module.css';
import { useAuth } from '../../context/AuthContext.jsx';

const DashboardNav = ({ userName = "User", userEmail = "user@example.com", userAvatar, userType = "Job Seeker" }) => {
    const navigate = useNavigate();
    const { user, logout, isRecruiter } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const resolvedUserName = user?.fullName || user?.email || userName;
    const resolvedUserEmail = user?.email || userEmail;

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <nav className={`${styles.navBox} ${scrolled ? styles.navScrolled : ''}`}>
                    {/* Logo */}
                    <button onClick={() => navigate(isRecruiter ? '/recruiter-dashboard' : '/dashboard')} className={styles.logo}>
                        Jobnexa
                    </button>

                    {/* Navigation Links - Different for Recruiter vs Job Seeker */}
                    <div className={styles.navLinks}>
                        {isRecruiter ? (
                            <>
                                <button onClick={() => navigate('/recruiter-dashboard')} className={styles.navLink}>
                                    Dashboard
                                </button>
                                <button onClick={() => navigate('/recruiter/posted-jobs')} className={styles.navLink}>
                                    Posted Jobs
                                </button>
                                <button onClick={() => navigate('/recruiter/applicants')} className={styles.navLink}>
                                    Applicants
                                </button>
                                <button onClick={() => navigate('/recruiter/post-job')} className={styles.navLink}>
                                    Post New Job
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => navigate('/dashboard')} className={styles.navLink}>
                                    Home
                                </button>
                                <button onClick={() => navigate('/jobs')} className={styles.navLink}>
                                    Jobs
                                </button>
                                <button onClick={() => navigate('/internships')} className={styles.navLink}>
                                    Internships
                                </button>
                                <button onClick={() => navigate('/mock-test')} className={styles.navLink}>
                                    Mock Test
                                </button>
                                <button onClick={() => navigate('/saved-jobs')} className={styles.navLink}>
                                    Saved Jobs
                                </button>
                                <button onClick={() => navigate('/applied-jobs')} className={styles.navLink}>
                                    Applied Jobs
                                </button>
                            </>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className={styles.profileSection} ref={dropdownRef}>
                        <button
                            className={styles.profileButton}
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            aria-label="Profile menu"
                        >
                            {userAvatar ? (
                                <img src={userAvatar} alt={userName} className={styles.avatar} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {getInitials(userName)}
                                </div>
                            )}
                        </button>

                        {dropdownOpen && (
                            <div className={styles.dropdown}>
                                <div className={styles.dropdownHeader}>
                                    <div className={styles.dropdownName}>{resolvedUserName}</div>
                                    <div className={styles.dropdownEmail}>{resolvedUserEmail}</div>
                                </div>
                                <div className={styles.dropdownDivider} />
                                <button
                                    className={styles.dropdownItem}
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        navigate('/profile');
                                    }}
                                >
                                    <svg className={styles.dropdownIcon} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Profile
                                </button>
                                <button
                                    className={styles.dropdownItem}
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        navigate('/settings');
                                    }}
                                >
                                    <svg className={styles.dropdownIcon} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    Settings
                                </button>
                                <div className={styles.dropdownDivider} />
                                <button
                                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                                    onClick={handleLogout}
                                >
                                    <svg className={styles.dropdownIcon} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default DashboardNav;
