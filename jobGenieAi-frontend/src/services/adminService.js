import apiClient from './apiClient';

const adminService = {
  async getStats() {
    try {
      const response = await apiClient.get('/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { totalUsers: 0, totalJobs: 0, totalApplications: 0 };
    }
  },

  async getAllApplications() {
    try {
      const response = await apiClient.get('/admin/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  },

  async getCandidateProfile(applicationId) {
    try {
      const response = await apiClient.get(`/admin/applications/${applicationId}/candidate-profile`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch candidate profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
      throw error;
    }
  },

  async updateApplicationStatus(applicationId, status) {
    try {
      const response = await apiClient.put(`/admin/applications/${applicationId}/status`, {
        status,
      });
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },
};

export default adminService;

