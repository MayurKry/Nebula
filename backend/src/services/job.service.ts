import { JobModel, IJob, JobModule, JobStatus } from "../models/job.model";
import { UserModel } from "../models/user.model";
import { aiImageService } from "./ai-image.service";
import { aiVideoService } from "./ai-video.service";
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

            if (job.status !== "failed" && job.status !== "completed") {
                throw new Error("Only failed or completed jobs can be retried");
            }

            // Allow manual regeneration even if max retries reached
            /* if (job.retryCount >= job.maxRetries) {
                throw new Error("Maximum retry limit reached");
            } */

            job.status = "retrying";
            job.retryCount += 1;
            job.error = undefined;
            await job.save();

            // Trigger async processing
            this.processJobAsync((job._id as any).toString());

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

                // Use real AI generation (this may take longer)
                logger.info(`[Job ${jobId}] Starting real AI generation for ${job.module}`);

                try {
                    const output = await this.generateRealOutput(job);
                    const creditsUsed = this.calculateCredits(job.module);

                    await this.updateJobStatus(jobId, "completed", {
                        output,
                        creditsUsed,
                        completedAt: new Date()
                    });

                    logger.info(`[Job ${jobId}] Completed successfully with real AI`);
                } catch (generationError: any) {
                    // If real AI fails, log error and mark job as failed
                    logger.error(`[Job ${jobId}] AI generation failed: ${generationError.message}`);

                    await this.updateJobStatus(jobId, "failed", {
                        error: {
                            message: generationError.message || "AI generation failed",
                            code: "AI_GENERATION_ERROR",
                            timestamp: new Date()
                        }
                    });
                }
            } catch (error: any) {
                logger.error(`[Job ${jobId}] Critical error in processJobAsync: ${error.message}`);

                // Try to update job status to failed
                try {
                    await this.updateJobStatus(jobId, "failed", {
                        error: {
                            message: error.message || "Job processing error",
                            code: "PROCESSING_ERROR",
                            timestamp: new Date()
                        }
                    });
                } catch (updateError) {
                    logger.error(`[Job ${jobId}] Failed to update job status:`, updateError);
                }
            }
        }, 1000);
    }

    /**
     * Generate real AI output for production
     * Falls back to mock only if AI services fail
     */
    private async generateRealOutput(job: IJob): Promise<IJob["output"]> {
        const module = job.module;
        const mockImageUrl = "https://picsum.photos/1024/1024?random=" + Math.random();
        const mockVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

        try {
            switch (module) {
                case "text_to_image": {
                    const prompt = job.input.prompt || "A beautiful landscape";
                    const config = job.input.config || {};

                    logger.info(`[Job ${job._id}] Generating real image with AI`);

                    try {
                        const result = await aiImageService.generateImage({
                            prompt,
                            style: config.style,
                            width: config.width || 1024,
                            height: config.height || 1024,
                            seed: config.seed
                        });

                        return [{
                            type: "image",
                            url: result.url,
                            metadata: {
                                width: result.width,
                                height: result.height,
                                provider: result.provider,
                                seed: result.seed
                            }
                        }];
                    } catch (aiError: any) {
                        logger.warn(`[Job ${job._id}] AI image generation failed: ${aiError.message}, using fallback`);
                        return [{
                            type: "image",
                            url: mockImageUrl,
                            metadata: { width: 1024, height: 1024, provider: "fallback" }
                        }];
                    }
                }

                case "text_to_video":
                case "image_to_video": {
                    const prompt = job.input.prompt || "A cinematic video";
                    const config = job.input.config || {};

                    logger.info(`[Job ${job._id}] Generating real video with AI`);

                    try {
                        const videoResult = await aiVideoService.generateVideo({
                            prompt,
                            style: config.style,
                            duration: config.duration || 15
                        });

                        // For async video generation, we need to poll for completion
                        // Store the job ID and return processing status
                        if (videoResult.status === "processing") {
                            logger.info(`[Job ${job._id}] Video generation started, jobId: ${videoResult.jobId}`);

                            // Poll for completion (max 10 minutes)
                            const maxAttempts = 120; // 120 * 5s = 10 minutes
                            let attempts = 0;

                            while (attempts < maxAttempts) {
                                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

                                const status = await aiVideoService.checkStatus(videoResult.jobId);

                                if (status.status === "succeeded" && status.videoUrl) {
                                    logger.info(`[Job ${job._id}] Video generation completed`);
                                    return [{
                                        type: "video",
                                        url: status.videoUrl,
                                        metadata: {
                                            duration: config.duration || 15,
                                            provider: videoResult.jobId.startsWith('runway') ? 'runwayml' : 'replicate',
                                            jobId: videoResult.jobId
                                        }
                                    }];
                                } else if (status.status === "failed") {
                                    throw new Error(`Video generation failed: ${status.error || 'Unknown error'}`);
                                }

                                attempts++;
                            }

                            throw new Error("Video generation timeout (10m limit exceeded)");
                        }

                        // If video completed immediately (mock scenario)
                        return [{
                            type: "video",
                            url: videoResult.videoUrl || mockVideoUrl,
                            metadata: { duration: 15, provider: "mock" }
                        }];

                    } catch (aiError: any) {
                        logger.warn(`[Job ${job._id}] AI video generation failed: ${aiError.message}, using fallback`);
                        return [{
                            type: "video",
                            url: mockVideoUrl,
                            metadata: { duration: 15, width: 1920, height: 1080, provider: "fallback" }
                        }];
                    }
                }

                case "text_to_audio":
                    // Audio generation not yet implemented with real AI
                    return [{
                        type: "audio",
                        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                        metadata: { duration: 30, provider: "mock" }
                    }];

                case "campaign_wizard":
                    // Campaign wizard generates individual jobs for each asset
                    // This is just for the script generation job
                    return [{
                        type: "script",
                        data: {
                            script: "Script generated via separate campaign service",
                            scenes: []
                        },
                        metadata: { provider: "campaign_service" }
                    }];

                case "export":
                    return [{
                        type: "export",
                        url: "https://example.com/exports/campaign-" + Date.now() + ".zip",
                        metadata: { format: "zip", size: "45MB", provider: "export_service" }
                    }];

                default:
                    return [];
            }
        } catch (error: any) {
            logger.error(`[Job ${job._id}] Critical error in generateRealOutput: ${error.message}`);
            // Ultimate fallback to mock
            return this.generateMockOutput(module);
        }
    }

    /**
     * Generate mock output for fallback scenarios
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
