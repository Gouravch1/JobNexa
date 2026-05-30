import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthContainer.module.css';

const AuthContainer = ({ children, title, subtitle }) => {
    return (
        <div className={styles.pageWrapper}>
            {/* Animated Background */}
            <div className={styles.backgroundAnimation}>
                <div className={styles.gradientOrb1}></div>
                <div className={styles.gradientOrb2}></div>
                <div className={styles.gradientOrb3}></div>
            </div>

            {/* Logo/Header */}
            <div className={styles.header}>
                <Link to="/" className={styles.logo}>
                    Jobnexa
                </Link>
            </div>

            {/* Auth Card */}
            <div className={styles.container}>
                <div className={styles.authCard}>
                    <div className={styles.cardHeader}>
                        <h1 className={styles.title}>{title}</h1>
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    </div>
                    <div className={styles.cardContent}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthContainer;
