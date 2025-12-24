import { Router } from "express";
import {
    generateImage,
    generateVideo,
    checkVideoStatus,
    generateVideoProject, // Import new controller
    regenerateScene, // Import new controller
    animateScene, // Import new controller
    generateStoryboard,
    updateOnboarding,
    getAIProviders,
    getHistory, // Import getHistory
    getHistoryItem, // Import getHistoryItem
} from "../controllers/ai.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// AI Generation endpoints
router.post("/generate-image", generateImage);
router.post("/generate-video", generateVideo);
router.post("/generate-video-project", generateVideoProject);
router.post("/regenerate-scene", regenerateScene);
router.post("/animate-scene", animateScene);
router.get("/video-status/:jobId", checkVideoStatus);
router.post("/generate-storyboard", generateStoryboard);
router.get("/providers", getAIProviders);
router.get("/history", getHistory); // Get all history
router.get("/history/:id", getHistoryItem); // Get single history item

// Onboarding
router.post("/onboarding", updateOnboarding);

export default router;
