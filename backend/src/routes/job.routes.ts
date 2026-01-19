import express from "express";
import { jobController } from "../controllers/job.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new job
router.post("/", jobController.createJob);

// Get all jobs for user
router.get("/", jobController.getUserJobs);

// Get job statistics
router.get("/stats", jobController.getJobStats);

// Get specific job
router.get("/:jobId", jobController.getJob);

// Retry a failed job
router.post("/:jobId/retry", jobController.retryJob);

// Cancel a job
router.post("/:jobId/cancel", jobController.cancelJob);

// Cancel all processing/queued jobs (for maintenance)
router.post("/cancel-all", jobController.cancelAllJobs);

// Get maintenance status
router.get("/maintenance/status", jobController.getMaintenanceStatus);

export default router;
