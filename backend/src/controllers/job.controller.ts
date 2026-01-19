import { Request, Response } from "express";
import { jobService } from "../services/job.service";
import { JobModule, JobStatus } from "../models/job.model";

export const jobController = {
    /**
     * Create a new job
     */
    async createJob(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { module, input, metadata } = req.body;

            if (!module || !input) {
                return res.status(400).json({
                    success: false,
                    message: "Module and input are required"
                });
            }

            const job = await jobService.createJob({
                userId,
                module,
                input,
                metadata
            });

            return res.status(201).json({
                success: true,
                message: "Job created successfully",
                data: job
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to create job"
            });
        }
    },

    /**
     * Get job by ID
     */
    async getJob(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { jobId } = req.params;
            const job = await jobService.getJobById(jobId, userId);

            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: job
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to get job"
            });
        }
    },

    /**
     * Get all jobs for user
     */
    async getUserJobs(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { module, status, limit, skip } = req.query;

            const result = await jobService.getUserJobs(userId, {
                module: module as JobModule,
                status: status as JobStatus,
                limit: limit ? parseInt(limit as string) : undefined,
                skip: skip ? parseInt(skip as string) : undefined
            });

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to get jobs"
            });
        }
    },

    /**
     * Retry a failed job
     */
    async retryJob(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { jobId } = req.params;
            const job = await jobService.retryJob(jobId, userId);

            return res.status(200).json({
                success: true,
                message: "Job retry initiated",
                data: job
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to retry job"
            });
        }
    },

    /**
     * Cancel a job
     */
    async cancelJob(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { jobId } = req.params;
            const job = await jobService.cancelJob(jobId, userId);

            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found or cannot be cancelled"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Job cancelled successfully",
                data: job
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to cancel job"
            });
        }
    },

    /**
     * Get job statistics
     */
    async getJobStats(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const stats = await jobService.getUserJobStats(userId);

            return res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to get job stats"
            });
        }
    },

    /**
     * Cancel all processing and queued jobs (for maintenance mode)
     */
    async cancelAllJobs(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const reason = req.body.reason || "System maintenance";
            const result = await jobService.cancelAllProcessingJobs(reason);

            return res.status(200).json({
                success: true,
                message: `Cancelled ${result.count} jobs`,
                data: {
                    count: result.count,
                    jobs: result.jobs
                }
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to cancel jobs"
            });
        }
    },

    /**
     * Get maintenance status
     */
    async getMaintenanceStatus(req: Request, res: Response) {
        try {
            const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
            const isGeminiMaintenance = process.env.GEMINI_MAINTENANCE === "true";

            return res.status(200).json({
                success: true,
                data: {
                    maintenanceMode: isMaintenanceMode,
                    geminiMaintenance: isGeminiMaintenance,
                    message: process.env.MAINTENANCE_MESSAGE || "System is under maintenance"
                }
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to get maintenance status"
            });
        }
    }
};
