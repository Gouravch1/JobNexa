import apiClient from './apiClient';

const interviewService = {
  async start(applicationId, options = {}) {
    const isMock = options.mode === 'mock';
    const endpoint = isMock
      ? '/mock-interview/start'
      : `/interview/start/${applicationId}`;
    const payload = isMock ? { testId: options.testId } : {};
    const response = await apiClient.post(endpoint, payload);
    if (!response.ok) {
      throw new Error('Failed to start interview');
    }
    const data = await response.json();
    return data;
  },

  async getQuestion(applicationId, options = {}) {
    const isMock = options.mode === 'mock';
    const endpoint = isMock
      ? `/mock-interview/question/${applicationId}`
      : `/interview/question/${applicationId}`;
    const response = await apiClient.get(endpoint);
    if (!response.ok) {
      let message = 'Failed to fetch question';
      try {
        const errorBody = await response.json();
        if (errorBody && errorBody.message) {
          message = errorBody.message;
        }
      } catch {
        // ignore parse errors
      }
      throw new Error(message);
    }
    const data = await response.json();
    return data;
  },

  async submitAnswer(applicationId, payload, options = {}) {
    const isMock = options.mode === 'mock';
    const endpoint = isMock
      ? `/mock-interview/answer/${applicationId}`
      : `/interview/answer/${applicationId}`;
    const response = await apiClient.post(endpoint, payload);
    if (!response.ok) {
      throw new Error('Failed to submit answer');
    }
    const data = await response.json();
    return data;
  },

  async submit(applicationId, options = {}) {
    const isMock = options.mode === 'mock';
    const endpoint = isMock
      ? `/mock-interview/submit/${applicationId}`
      : `/interview/submit/${applicationId}`;
    const response = await apiClient.post(endpoint, {});
    if (!response.ok) {
      throw new Error('Failed to submit interview');
    }
    const data = await response.json();
    return data;
  },

  async getResult(applicationId, options = {}) {
    const isMock = options.mode === 'mock';
    const endpoint = isMock
      ? `/mock-interview/result/${applicationId}`
      : `/interview/result/${applicationId}`;
    const response = await apiClient.get(endpoint);
    if (!response.ok) {
      throw new Error('Failed to fetch interview result');
    }
    const data = await response.json();
    return data;
  },
};

export default interviewService;

