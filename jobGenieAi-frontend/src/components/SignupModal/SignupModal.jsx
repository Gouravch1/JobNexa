import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignupModal.module.css';
import FormInput from '../FormInput/FormInput';
import AuthButton from '../AuthButton/AuthButton';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext';

// Icons (same as before)
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);



const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: '2' // Default to Job Seeker
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthLabel = () => {
        const labels = ['Weak', 'Fair', 'Good', 'Strong'];
        return formData.password ? labels[passwordStrength - 1] || 'Weak' : '';
    };

    const getPasswordStrengthColor = () => {
        const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];
        return colors[passwordStrength - 1] || '#ef4444';
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await authService.register(
                formData.fullName,
                formData.email,
                formData.password,
                parseInt(formData.userType)
            );

            if (response.success) {
                console.log('Registration successful:', response);
                login(response);
                onClose();

                if (response.userType === 'Recruiter') {
                    navigate('/recruiter-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setErrors({ email: response.message || 'Registration failed' });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ email: 'Registration failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };



    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    <CloseIcon />
                </button>

                <div className={styles.modalHeader}>
                    <h2 className={styles.title}>Create Your Account</h2>
                    <p className={styles.subtitle}>Start your journey to landing your dream job</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <FormInput
                        label="Full Name"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        icon={<UserIcon />}
                        error={errors.fullName}
                        required
                    />

                    <div>
                        <label className={styles.label}>I am a</label>
                        <select
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="2">Job Seeker</option>
                            <option value="1">Recruiter</option>
                        </select>
                    </div>

                    <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        icon={<MailIcon />}
                        error={errors.email}
                        required
                    />

                    <div>
                        <FormInput
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a strong password"
                            icon={<LockIcon />}
                            error={errors.password}
                            required
                        />

                        {formData.password && (
                            <div className={styles.passwordStrength}>
                                <div className={styles.strengthBar}>
                                    <div
                                        className={styles.strengthFill}
                                        style={{
                                            width: `${(passwordStrength / 4) * 100}%`,
                                            backgroundColor: getPasswordStrengthColor()
                                        }}
                                    />
                                </div>
                                <span
                                    className={styles.strengthLabel}
                                    style={{ color: getPasswordStrengthColor() }}
                                >
                                    {getPasswordStrengthLabel()}
                                </span>
                            </div>
                        )}
                    </div>

                    <FormInput
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        icon={<LockIcon />}
                        error={errors.confirmPassword}
                        required
                    />

                    <AuthButton type="submit" loading={loading} variant="primary">
                        Create Account
                    </AuthButton>

                    <p className={styles.footer}>
                        Already have an account?{' '}
                        <button type="button" onClick={onSwitchToLogin} className={styles.link}>
                            Log in
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignupModal;
