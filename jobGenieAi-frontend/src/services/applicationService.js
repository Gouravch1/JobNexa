import apiClient from './apiClient';

const applicationService = {
  async getUserApplications() {
    try {
      const response = await apiClient.get('/applications/user');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const applications = await response.json();
      return applications || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  },

  async applyToJob({ jobId, useSavedResume, file }) {
    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('useSavedResume', useSavedResume ? 'true' : 'false');
      if (!useSavedResume && file) {
        formData.append('resume', file);
      }

      const response = await apiClient.post('/applications/apply', formData, {
        headers: {},
      });

      if (!response.ok) {
        throw new Error('Failed to apply to job');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error applying to job:', error);
      throw error;
    }
  },

  async getJobApplications(jobId) {
    try {
      const response = await apiClient.get(`/applications/job/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job applications');
      }
      const applications = await response.json();
      return applications || [];
    } catch (error) {
      console.error('Error fetching job applications:', error);
      throw error;
    }
  },
};

export default applicationService;

