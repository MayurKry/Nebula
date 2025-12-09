import { Router } from "express";
import {
    generateImage,
    generateVideo,
    checkVideoStatus,
    generateStoryboard,
    updateOnboarding,
} from "../controllers/ai.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// AI Generation endpoints
router.post("/generate-image", generateImage);
router.post("/generate-video", generateVideo);
router.get("/video-status/:jobId", checkVideoStatus);
router.post("/generate-storyboard", generateStoryboard);

// Onboarding
router.post("/onboarding", updateOnboarding);

export default router;
