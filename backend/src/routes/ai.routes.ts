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
    enhancePrompt, // Import enhancePrompt
} from "../controllers/ai.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireFeature } from "../middlewares/feature-guard.middleware";

const router = Router();

// All routes require authentication and tenant context
router.use(authenticate);
router.use(requireTenant);

// AI Generation endpoints
router.post("/generate-image", requireFeature("TEXT_TO_IMAGE"), generateImage);
router.post("/generate-video", requireFeature("TEXT_TO_VIDEO"), generateVideo);
router.post("/generate-video-project", requireFeature("TEXT_TO_VIDEO"), generateVideoProject);
router.post("/regenerate-scene", regenerateScene);
router.post("/animate-scene", animateScene);
router.get("/video-status/:jobId", checkVideoStatus);
router.post("/generate-storyboard", generateStoryboard);
router.get("/providers", getAIProviders);
router.get("/history", getHistory); // Get all history
router.get("/history/:id", getHistoryItem); // Get single history item
router.post("/enhance-prompt", enhancePrompt); // Enhance prompt

// Onboarding
router.post("/onboarding", updateOnboarding);

export default router;
