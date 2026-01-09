import { JobModel, IJob, JobModule, JobStatus } from "../models/job.model";
import { UserModel } from "../models/user.model";
import mongoose from "mongoose";
import logger from "../utils/logger";

class JobService {
    /**
     * Create a new job
     */
    async createJob(data: {
        userId: string;
        module: JobModule;
        input: IJob["input"];
        metadata?: Record<string, any>;
    }): Promise<IJob> {
        try {
            const cost = this.calculateCredits(data.module);
            const user = await UserModel.findById(data.userId);

            if (!user) {
                throw new Error("User not found");
            }

            if ((user.credits || 0) < cost) {
                throw new Error(`Insufficient credits. Required: ${cost}, Available: ${user.credits || 0}`);
            }

            // Deduct credits
            user.credits = (user.credits || 0) - cost;
            await user.save();

            const job = await JobModel.create({
                userId: new mongoose.Types.ObjectId(data.userId),
                module: data.module,
                status: "queued",
                input: data.input,
                metadata: data.metadata,
                queuedAt: new Date(),
                creditsUsed: cost,
                retryCount: 0,
                maxRetries: 3
            });

            logger.info(`Job created: ${job._id} for module ${data.module}`);

            // In a real implementation, this would trigger the job processor
            // For now, we'll simulate async processing
            this.processJobAsync((job._id as any).toString());

            return job;
        } catch (error: any) {
            logger.error("Failed to create job:", error);
            throw new Error(error.message || "Failed to create job");
        }
    }

    /**
     * Get job by ID
     */
    async getJobById(jobId: string, userId: string): Promise<IJob | null> {
        try {
            const job = await JobModel.findOne({
                _id: jobId,
                userId: new mongoose.Types.ObjectId(userId)
            });
            return job;
        } catch (error: any) {
            logger.error("Failed to get job:", error);
            return null;
        }
    }

    /**
     * Get all jobs for a user
     */
    async getUserJobs(
        userId: string,
        filters?: {
            module?: JobModule;
            status?: JobStatus;
            limit?: number;
            skip?: number;
        }
    ): Promise<{ jobs: IJob[]; total: number }> {
        try {
            const query: any = { userId: new mongoose.Types.ObjectId(userId) };

            if (filters?.module) query.module = filters.module;
            if (filters?.status) query.status = filters.status;

            const total = await JobModel.countDocuments(query);
            const jobs = await JobModel.find(query)
                .sort({ createdAt: -1 })
                .limit(filters?.limit || 50)
                .skip(filters?.skip || 0);

            return { jobs, total };
        } catch (error: any) {
            logger.error("Failed to get user jobs:", error);
            throw new Error("Failed to get user jobs");
        }
    }

    /**
     * Update job status
     */
    async updateJobStatus(
        jobId: string,
        status: JobStatus,
        updates?: Partial<IJob>
    ): Promise<IJob | null> {
        try {
            const updateData: any = { status, ...updates };

            if (status === "processing" && !updates?.startedAt) {
                updateData.startedAt = new Date();
            }

            if (status === "completed" && !updates?.completedAt) {
                updateData.completedAt = new Date();
            }

            const job = await JobModel.findByIdAndUpdate(
                jobId,
                updateData,
                { new: true }
            );

            return job;
        } catch (error: any) {
            logger.error("Failed to update job status:", error);
            return null;
        }
    }

    /**
     * Retry a failed job
     */
    async retryJob(jobId: string, userId: string): Promise<IJob | null> {
        try {
            const job = await JobModel.findOne({
                _id: jobId,
                userId: new mongoose.Types.ObjectId(userId)
            });

            if (!job) {
                throw new Error("Job not found");
            }

            if (job.status !== "failed") {
                throw new Error("Only failed jobs can be retried");
            }

            if (job.retryCount >= job.maxRetries) {
                throw new Error("Maximum retry limit reached");
            }

            job.status = "retrying";
            job.retryCount += 1;
            job.error = undefined;
            await job.save();

            // Trigger async processing
            this.processJobAsync(job._id.toString());

            return job;
        } catch (error: any) {
            logger.error("Failed to retry job:", error);
            throw error;
        }
    }

    /**
     * Cancel a job
     */
    async cancelJob(jobId: string, userId: string): Promise<IJob | null> {
        try {
            const job = await JobModel.findOneAndUpdate(
                {
                    _id: jobId,
                    userId: new mongoose.Types.ObjectId(userId),
                    status: { $in: ["queued", "processing"] }
                },
                { status: "cancelled" },
                { new: true }
            );

            return job;
        } catch (error: any) {
            logger.error("Failed to cancel job:", error);
            return null;
        }
    }

    /**
     * Simulate async job processing
     * In production, this would be handled by a job queue (Bull, BullMQ, etc.)
     */
    private async processJobAsync(jobId: string): Promise<void> {
        // Don't await - let it run in background
        setTimeout(async () => {
            try {
                const job = await JobModel.findById(jobId);
                if (!job || job.status === "cancelled") return;

                // Update to processing
                await this.updateJobStatus(jobId, "processing");

                // Simulate processing time (faster for demo)
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Simulate success/failure (100% success for demo)
                const success = true;

                if (success) {
                    // Simulate successful output based on module
                    const output = this.generateMockOutput(job.module);
                    const creditsUsed = this.calculateCredits(job.module);

                    await this.updateJobStatus(jobId, "completed", {
                        output,
                        creditsUsed,
                        completedAt: new Date()
                    });

                    logger.info(`Job ${jobId} completed successfully`);
                } else {
                    // Simulate failure
                    await this.updateJobStatus(jobId, "failed", {
                        error: {
                            message: "Simulated processing error",
                            code: "PROCESSING_ERROR",
                            timestamp: new Date()
                        }
                    });

                    logger.warn(`Job ${jobId} failed`);
                }
            } catch (error: any) {
                logger.error(`Error processing job ${jobId}:`, error);
            }
        }, 1000);
    }

    /**
     * Generate mock output for demonstration
     */
    private generateMockOutput(module: JobModule): IJob["output"] {
        const mockImageUrl = "https://picsum.photos/1024/1024?random=" + Math.random();
        const mockVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

        switch (module) {
            case "text_to_image":
                return [{
                    type: "image",
                    url: mockImageUrl,
                    metadata: { width: 1024, height: 1024 }
                }];

            case "text_to_video":
            case "image_to_video":
                return [{
                    type: "video",
                    url: mockVideoUrl,
                    metadata: { duration: 15, width: 1920, height: 1080 }
                }];

            case "text_to_audio":
                return [{
                    type: "audio",
                    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    metadata: { duration: 30 }
                }];

            case "campaign_wizard":
                return [
                    {
                        type: "script",
                        data: {
                            script: "Welcome to our amazing product! Transform your life today with cutting-edge technology.",
                            scenes: ["Opening shot", "Product showcase", "Customer testimonial", "Call to action"]
                        }
                    },
                    {
                        type: "image",
                        url: mockImageUrl,
                        metadata: { platform: "Instagram", aspectRatio: "1:1" }
                    },
                    {
                        type: "video",
                        url: mockVideoUrl,
                        metadata: { platform: "YouTube", duration: 30 }
                    }
                ];

            case "export":
                return [{
                    type: "export",
                    url: "https://example.com/exports/campaign-" + Date.now() + ".zip",
                    metadata: { format: "zip", size: "45MB" }
                }];

            default:
                return [];
        }
    }

    /**
     * Calculate credits based on module
     */
    private calculateCredits(module: JobModule): number {
        const creditMap: Record<JobModule, number> = {
            text_to_image: 1,
            text_to_video: 5,
            image_to_video: 3,
            text_to_audio: 2,
            campaign_wizard: 10,
            export: 1
        };
        return creditMap[module] || 1;
    }

    /**
     * Get job statistics for a user
     */
    async getUserJobStats(userId: string): Promise<{
        total: number;
        byStatus: Record<JobStatus, number>;
        byModule: Record<JobModule, number>;
        totalCreditsUsed: number;
    }> {
        try {
            const jobs = await JobModel.find({
                userId: new mongoose.Types.ObjectId(userId)
            });

            const stats = {
                total: jobs.length,
                byStatus: {} as Record<JobStatus, number>,
                byModule: {} as Record<JobModule, number>,
                totalCreditsUsed: 0
            };

            jobs.forEach(job => {
                // Count by status
                stats.byStatus[job.status] = (stats.byStatus[job.status] || 0) + 1;

                // Count by module
                stats.byModule[job.module] = (stats.byModule[job.module] || 0) + 1;

                // Sum credits
                stats.totalCreditsUsed += job.creditsUsed;
            });

            return stats;
        } catch (error: any) {
            logger.error("Failed to get job stats:", error);
            throw new Error("Failed to get job stats");
        }
    }
}

export const jobService = new JobService();
export default jobService;
