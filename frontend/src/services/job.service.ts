import axiosInstance from '@/api/axiosInstance';

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
    /**
     * Create a new job
     */
    async createJob(data: {
        module: JobModule;
        input: Job['input'];
        metadata?: Record<string, any>;
    }): Promise<Job> {
        const response = await axiosInstance.post('/jobs', data);
        return response.data.data;
    }

    /**
     * Get job by ID
     */
    async getJob(jobId: string): Promise<Job> {
        const response = await axiosInstance.get(`/jobs/${jobId}`);
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
        const params: any = {};
        if (filters?.module) params.module = filters.module;
        if (filters?.status) params.status = filters.status;
        if (filters?.limit) params.limit = filters.limit;
        if (filters?.skip) params.skip = filters.skip;

        const response = await axiosInstance.get('/jobs', { params });
        return response.data.data;
    }

    /**
     * Retry a failed job
     */
    async retryJob(jobId: string): Promise<Job> {
        const response = await axiosInstance.post(`/jobs/${jobId}/retry`, {});
        return response.data.data;
    }

    /**
     * Cancel a job
     */
    async cancelJob(jobId: string): Promise<Job> {
        const response = await axiosInstance.post(`/jobs/${jobId}/cancel`, {});
        return response.data.data;
    }

    /**
     * Get job statistics
     */
    async getJobStats(): Promise<JobStats> {
        const response = await axiosInstance.get('/jobs/stats');
        return response.data.data;
    }
}

export const jobService = new JobService();
export default jobService;
