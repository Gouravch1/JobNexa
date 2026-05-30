import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = authService.getCurrentUser();
      const storedToken = localStorage.getItem('authToken');

      // Only restore session if BOTH a valid user object and a token exist.
      // This prevents stale dev/test localStorage data from auto-logging in.
      if (storedUser && storedToken && storedUser.email && storedUser.userId) {
        setUser(storedUser);
      } else if (storedUser || storedToken) {
        // Clear any incomplete/stale session data
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
      }
    } catch (e) {
      // Clear on any parse error
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userResponse) => {
    if (!userResponse) return;

    const userType = userResponse.userType
      || (userResponse.role === 'ADMIN' ? 'Recruiter' : 'Job Seeker');

    const storedUser = {
      email: userResponse.email,
      userId: userResponse.userId,
      userType,
    };

    localStorage.setItem('user', JSON.stringify(storedUser));
    localStorage.setItem('userType', userType);

    if (userResponse.token) {
      localStorage.setItem('authToken', userResponse.token);
    }

    setUser(storedUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isRecruiter = user?.userType === 'Recruiter' || user?.userType === 1;
  const isJobSeeker = user?.userType === 'Job Seeker' || user?.userType === 2;

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isRecruiter,
    isJobSeeker,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

