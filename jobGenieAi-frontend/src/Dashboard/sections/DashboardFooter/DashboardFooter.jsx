import React from 'react';
import styles from './DashboardFooter.module.css';

const DashboardFooter = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    {/* Branding */}
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            Jobnexa
                        </div>
                        <p className={styles.tagline}>
                            Your AI-powered career companion for landing dream jobs faster.
                        </p>
                        <div className={styles.social}>
                            <a href="#" className={styles.socialLink} aria-label="Twitter">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                                </svg>
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="GitHub">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.linksGroup}>
                        <h4 className={styles.linksTitle}>Quick Links</h4>
                        <ul className={styles.linksList}>
                            <li><a href="#jobs">Jobs</a></li>
                            <li><a href="#internships">Internships</a></li>
                            <li><a href="#saved-jobs">Saved Jobs</a></li>
                            <li><a href="#testimonials">Testimonials</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className={styles.linksGroup}>
                        <h4 className={styles.linksTitle}>Company</h4>
                        <ul className={styles.linksList}>
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/contact">Contact</a></li>
                            <li><a href="/careers">Careers</a></li>
                            <li><a href="/blog">Blog</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className={styles.linksGroup}>
                        <h4 className={styles.linksTitle}>Legal</h4>
                        <ul className={styles.linksList}>
                            <li><a href="/privacy">Privacy Policy</a></li>
                            <li><a href="/terms">Terms of Service</a></li>
                            <li><a href="/cookies">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} Jobnexa. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default DashboardFooter;
