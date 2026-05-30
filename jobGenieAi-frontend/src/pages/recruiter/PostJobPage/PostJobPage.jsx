import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNav from '../../../components/DashboardNav/DashboardNav';
import DashboardFooter from '../../../Dashboard/sections/DashboardFooter/DashboardFooter';
import jobService from '../../../services/jobService';
import { useNotification } from '../../../context/NotificationContext';
import styles from './PostJobPage.module.css';

const PostJobPage = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.email?.split('@')[0] || 'Recruiter';

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        jobType: 'Full-time',
        experience: '',
        salary: '',
        skills: '',
        description: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        if (!formData.company.trim()) newErrors.company = 'Company name is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.description.trim()) newErrors.description = 'Job description is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const result = await jobService.postJob(formData);
                if (result.success) {
                    showNotification('Job posted successfully!', { type: 'success' });
                    navigate('/recruiter/posted-jobs');
                } else {
                    showNotification(result.message || 'Failed to post job.', { type: 'error' });
                }
            } catch (error) {
                console.error('Error posting job:', error);
                showNotification('Failed to post job. Please try again.', { type: 'error' });
            }
        }
    };

    return (
        <div className={styles.page}>
            <DashboardNav userName={userName} userEmail={user.email} userType="Recruiter" />

            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Post a New Job</h1>
                            <p className={styles.subtitle}>Find the perfect candidate for your team</p>
                        </div>
                        <button
                            onClick={() => navigate('/recruiter-dashboard')}
                            className={styles.backButton}
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formCard}>
                            <h2 className={styles.sectionTitle}>Basic Information</h2>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Job Title <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="e.g., Senior Frontend Developer"
                                    />
                                    {errors.title && <span className={styles.error}>{errors.title}</span>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Company <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Your company name"
                                    />
                                    {errors.company && <span className={styles.error}>{errors.company}</span>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Location <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="City, Country or Remote"
                                    />
                                    {errors.location && <span className={styles.error}>{errors.location}</span>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Job Type</label>
                                    <select
                                        name="jobType"
                                        value={formData.jobType}
                                        onChange={handleChange}
                                        className={styles.select}
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Experience Required</label>
                                    <input
                                        type="text"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="e.g., 2-5 years"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Salary Range</label>
                                    <input
                                        type="text"
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="e.g., ₹10-15 LPA"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formCard}>
                            <h2 className={styles.sectionTitle}>Job Details</h2>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Required Skills</label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="e.g., React, JavaScript, Node.js (comma separated)"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Job Description <span className={styles.required}>*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows="10"
                                    placeholder="Describe the role, responsibilities, and requirements..."
                                />
                                {errors.description && <span className={styles.error}>{errors.description}</span>}
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                onClick={() => navigate('/recruiter-dashboard')}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button type="submit" className={styles.submitButton}>
                                📝 Post Job
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <DashboardFooter />
        </div>
    );
};

export default PostJobPage;
