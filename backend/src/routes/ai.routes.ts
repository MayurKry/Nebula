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
router.post("/animate-scene", animateScene); // Add new route
router.get("/video-status/:jobId", checkVideoStatus);
router.post("/generate-storyboard", generateStoryboard);
router.get("/providers", getAIProviders);

// Onboarding
router.post("/onboarding", updateOnboarding);

export default router;
