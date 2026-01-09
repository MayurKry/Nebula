import express from "express";
import { campaignController } from "../controllers/campaign.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new campaign
router.post("/", campaignController.createCampaign);

// Get all campaigns for user
router.get("/", campaignController.getUserCampaigns);

// Get specific campaign
router.get("/:campaignId", campaignController.getCampaign);

// Update campaign
router.put("/:campaignId", campaignController.updateCampaign);

// Delete campaign
router.delete("/:campaignId", campaignController.deleteCampaign);

// Generate script (Step 6)
router.post("/:campaignId/generate-script", campaignController.generateScript);

// Start generation (Step 7)
router.post("/:campaignId/start-generation", campaignController.startGeneration);

// Get campaign status
router.get("/:campaignId/status", campaignController.getCampaignStatus);

// Export campaign
router.post("/:campaignId/export", campaignController.exportCampaign);

// Cancel generation
router.post("/:campaignId/cancel", campaignController.cancelGeneration);

export default router;
