import apiClient from './apiClient';

/**
 * Job Service
 * Handles all job and internship-related API calls
 */
const jobService = {
    /**
     * Post a new job or internship
     * @param {object} jobData - Job posting data
     * @returns {Promise} API response
     */
    async postJob(jobData) {
        try {
            const type = jobData.jobType === 'Internship' ? 'INTERNSHIP' : 'JOB';

            const response = await apiClient.post('/jobs', {
                title: jobData.title,
                company: jobData.company,
                location: jobData.location,
                experience: jobData.experience,
                salaryRange: jobData.salary,
                description: jobData.description,
                skills: jobData.skills,
                type
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                return {
                    success: false,
                    message: errData?.message || 'Failed to post job',
                };
            }

            const data = await response.json();
            return { success: true, ...data };
        } catch (error) {
            console.error('Error posting job:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    },

    /**
     * Get all jobs (excludes internships)
     * @returns {Promise} List of jobs
     */
    async getAllJobs() {
        try {
            const response = await apiClient.get('/jobs');

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const jobs = await response.json();
            return jobs;
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
    },

    /**
     * Get all internships
     * @returns {Promise} List of internships
     */
    async getAllInternships() {
        try {
            const response = await apiClient.get('/jobs/type/INTERNSHIP');

            if (!response.ok) {
                throw new Error('Failed to fetch internships');
            }

            const internships = await response.json();
            return internships;
        } catch (error) {
            console.error('Error fetching internships:', error);
            return [];
        }
    },

    /**
     * Get a specific job by ID
     * @param {number} id - Job ID
     * @returns {Promise} Job details
     */
    async getJobById(id) {
        try {
            const response = await apiClient.get(`/jobs/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch job');
            }

            const job = await response.json();
            return job;
        } catch (error) {
            console.error('Error fetching job:', error);
            return null;
        }
    },

    /**
     * Get jobs posted by a specific recruiter
     * @param {number} userId - Recruiter user ID
     * @returns {Promise} List of recruiter's jobs
     */
    async getRecruiterJobs() {
        try {
            const response = await apiClient.get('/jobs/mine');

            if (!response.ok) {
                throw new Error('Failed to fetch recruiter jobs');
            }

            const jobs = await response.json();
            return jobs;
        } catch (error) {
            console.error('Error fetching recruiter jobs:', error);
            return [];
        }
    },

    /**
     * Update a job posting
     * @param {number} id - Job ID
     * @param {object} jobData - Updated job data
     * @returns {Promise} API response
     */
    async updateJob(id, jobData) {
        try {
            const response = await apiClient.put(`/jobs/${id}`, {
                jobTitle: jobData.title,
                company: jobData.company,
                location: jobData.location,
                jobType: jobData.jobType,
                salary: jobData.salary,
                description: jobData.description,
                remote: jobData.remote
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating job:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    },

    /**
     * Delete/close a job posting
     * @param {number} id - Job ID
     * @returns {Promise} API response
     */
    async deleteJob(id) {
        try {
            const response = await apiClient.del(`/jobs/${id}`);
            // Backend returns 204 No Content on success
            if (response.status === 204 || response.ok) {
                return { success: true };
            }
            let data = null;
            try {
                data = await response.json();
            } catch {
                // ignore body parse errors for non-2xx
            }
            return {
                success: false,
                message: data?.message || 'Failed to delete job',
            };
        } catch (error) {
            console.error('Error deleting job:', error);
            return {
                success: false,
                message: 'Network error. Please try again.'
            };
        }
    }
};

export default jobService;
