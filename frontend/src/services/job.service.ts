import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';

// Get auth token
const getAuthToken = () => {
    const token = localStorage.getItem('accessToken');
    return token;
};

// Job types
export type JobModule =
    | "campaign_wizard"
    | "text_to_image"
    | "text_to_video"
    | "image_to_video"
    | "text_to_audio"
    | "export";

export type JobStatus =
    | "queued"
    | "processing"
    | "completed"
    | "failed"
    | "retrying"
    | "cancelled";

export interface JobOutput {
    type: "image" | "video" | "audio" | "script" | "export";
    url?: string;
    data?: any;
    metadata?: Record<string, any>;
}

export interface Job {
    _id: string;
    userId: string;
    module: JobModule;
    status: JobStatus;
    input: {
        prompt?: string;
        campaignId?: string;
        assetIds?: string[];
        config?: Record<string, any>;
    };
    output?: JobOutput[];
    creditsUsed: number;
    retryCount: number;
    maxRetries: number;
    error?: {
        message: string;
        code?: string;
        timestamp: string;
    };
    metadata?: Record<string, any>;
    queuedAt: string;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface JobStats {
    total: number;
    byStatus: Record<JobStatus, number>;
    byModule: Record<JobModule, number>;
    totalCreditsUsed: number;
}

class JobService {
    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        };
    }

    /**
     * Create a new job
     */
    async createJob(data: {
        module: JobModule;
        input: Job['input'];
        metadata?: Record<string, any>;
    }): Promise<Job> {
        const response = await axios.post(
            `${API_BASE_URL}/jobs`,
            data,
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }

    /**
     * Get job by ID
     */
    async getJob(jobId: string): Promise<Job> {
        const response = await axios.get(
            `${API_BASE_URL}/jobs/${jobId}`,
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }

    /**
     * Get all jobs for user
     */
    async getUserJobs(filters?: {
        module?: JobModule;
        status?: JobStatus;
        limit?: number;
        skip?: number;
    }): Promise<{ jobs: Job[]; total: number }> {
        const params = new URLSearchParams();
        if (filters?.module) params.append('module', filters.module);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.skip) params.append('skip', filters.skip.toString());

        const response = await axios.get(
            `${API_BASE_URL}/jobs?${params.toString()}`,
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }

    /**
     * Retry a failed job
     */
    async retryJob(jobId: string): Promise<Job> {
        const response = await axios.post(
            `${API_BASE_URL}/jobs/${jobId}/retry`,
            {},
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }

    /**
     * Cancel a job
     */
    async cancelJob(jobId: string): Promise<Job> {
        const response = await axios.post(
            `${API_BASE_URL}/jobs/${jobId}/cancel`,
            {},
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }

    /**
     * Get job statistics
     */
    async getJobStats(): Promise<JobStats> {
        const response = await axios.get(
            `${API_BASE_URL}/jobs/stats`,
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }
}

export const jobService = new JobService();
export default jobService;
