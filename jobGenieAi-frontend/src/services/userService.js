import apiClient from './apiClient';

const API_BASE = 'http://localhost:8080';

function normalizeProfile(data) {
  if (!data) return data;
  return {
    ...data,
    fullName: data.fullName || data.name || '',
    resumeUrl: data.resumeUrl
      ? data.resumeUrl.startsWith('http')
        ? data.resumeUrl
        : `${API_BASE}${data.resumeUrl}`
      : '',
  };
}

const userService = {
  async getCurrentProfile() {
    try {
      const response = await apiClient.get('/users/me');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const profile = await response.json();
      return normalizeProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateProfile(profile) {
    try {
      const body = {
        fullName: profile.fullName,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
      };

      const response = await apiClient.put('/users/me', body);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update profile');
      }
      const data = await response.json();
      return normalizeProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async getSettings() {
    try {
      const response = await apiClient.get('/users/me/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  async updateSettings(settings) {
    try {
      const body = {
        email: settings.email,
        emailNotifications: settings.emailNotifications,
        jobAlerts: settings.jobAlerts,
        applicationUpdates: settings.applicationUpdates,
        weeklyNewsletter: settings.weeklyNewsletter,
        profileVisibility: settings.profileVisibility,
        showEmail: settings.showEmail,
        showPhone: settings.showPhone,
        language: settings.language,
        timezone: settings.timezone,
      };

      if (settings.newPassword) {
        body.currentPassword = settings.currentPassword;
        body.newPassword = settings.newPassword;
        body.confirmPassword = settings.confirmPassword;
      }

      const response = await apiClient.put('/users/me/settings', body);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update settings');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  async uploadResume(file) {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await apiClient.post('/users/me/resume', formData, {
        headers: {},
      });

      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }

      const data = await response.json();
      return normalizeProfile(data);
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  },
};

export default userService;
