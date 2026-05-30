import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContainer from '../components/AuthContainer/AuthContainer';
import FormInput from '../components/FormInput/FormInput';
import AuthButton from '../components/AuthButton/AuthButton';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import styles from './Login.module.css';

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



const Login = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { login } = useAuth();
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

        // Clear error when user starts typing
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
                login(response);
                showNotification('Login successful! Redirecting to dashboard...', { type: 'success' });
                if (response.userType === 'Recruiter') {
                    navigate('/recruiter-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setErrors({ email: response.message || 'Invalid email or password.' });
                showNotification(response.message || 'Invalid email or password.', { type: 'error' });
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ email: 'Login failed. Please try again.' });
            showNotification('Login failed. Please try again.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };



    const handleForgotPassword = () => {
        showNotification('Password reset functionality will be implemented.', { type: 'info' });
    };

    return (
        <AuthContainer
            title="Welcome Back"
            subtitle="Sign in to continue your job search"
        >
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
                    <Link to="/signup" className={styles.link}>
                        Sign up
                    </Link>
                </p>
            </form>
        </AuthContainer>
    );
};

export default Login;
