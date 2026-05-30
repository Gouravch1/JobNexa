import apiClient from './apiClient';

const mockTestService = {
  async getTracks() {
    const response = await apiClient.get('/mock-tests/tracks');
    if (!response.ok) {
      throw new Error('Failed to fetch mock test tracks');
    }
    return response.json();
  },

  async getTestsByTrack(trackId) {
    const response = await apiClient.get(`/mock-tests/tests/${trackId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch mock tests');
    }
    return response.json();
  },

  async startMockTest(testId) {
    const response = await apiClient.post('/mock-tests/start', { testId });
    if (!response.ok) {
      throw new Error('Failed to start mock test');
    }
    return response.json();
  },
};

export default mockTestService;
