import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginModal.module.css';
import FormInput from '../FormInput/FormInput';
import AuthButton from '../AuthButton/AuthButton';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext';

// Icons
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

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await authService.login(formData.email, formData.password);

            if (response.success) {
                console.log('Login successful:', response);
                login(response);
                onClose();

                if (response.userType === 'Recruiter') {
                    navigate('/recruiter-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setErrors({ email: response.message || 'Login failed' });
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ email: 'Login failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };



    const handleForgotPassword = () => {
        showNotification('Password reset functionality will be implemented.', { type: 'info' });
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    <CloseIcon />
                </button>

                <div className={styles.modalHeader}>
                    <h2 className={styles.title}>Welcome Back</h2>
                    <p className={styles.subtitle}>Sign in to continue your job search</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
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

                    <FormInput
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        icon={<LockIcon />}
                        error={errors.password}
                        required
                    />

                    <AuthButton type="submit" loading={loading} variant="primary">
                        Sign In
                    </AuthButton>

                    <p className={styles.footer}>
                        Don't have an account?{' '}
                        <button type="button" onClick={onSwitchToSignup} className={styles.link}>
                            Sign up
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
