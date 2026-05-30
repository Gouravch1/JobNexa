import apiClient from './apiClient';

const API_AUTH_BASE = '/auth';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
    /**
     * Register a new user
     * @param {string} fullName - User's full name
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @param {number} userTypeId - User type (1 = Recruiter, 2 = Job Seeker)
     */
    async register(fullName, email, password, userTypeId = 2) {
        try {
            const role = userTypeId === 1 ? 'ADMIN' : 'USER';

            const response = await apiClient.post(`${API_AUTH_BASE}/register`, {
                name: fullName,
                email,
                password,
                role
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Registration failed (${response.status})`);
            }

            const data = await response.json();

            const userType = data.role === 'ADMIN' ? 'Recruiter' : 'Job Seeker';

            const storedUser = {
                email: data.email,
                userId: data.userId,
                userType,
            };

            localStorage.setItem('user', JSON.stringify(storedUser));
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userType', userType);

            return {
                success: true,
                ...data,
                userType,
            };

        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.message || 'Network error. Please try again.'
            };
        }
    },

    /**
     * Login user
     * @param {string} email - User's email
     * @param {string} password - User's password
     */
    async login(email, password) {
        try {
            const response = await apiClient.post(`${API_AUTH_BASE}/login`, {
                email,
                password
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Login failed (${response.status})`);
            }

            const data = await response.json();

            if (!data.token) {
                throw new Error('Invalid response from server: no token received.');
            }

            const userType = data.role === 'ADMIN' ? 'Recruiter' : 'Job Seeker';

            const storedUser = {
                email: data.email,
                userId: data.userId,
                userType,
            };

            localStorage.setItem('user', JSON.stringify(storedUser));
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userType', userType);

            return {
                success: true,
                ...data,
                userType,
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message || 'Network error. Please try again.'
            };
        }
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
    },

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }
};

export default authService;
