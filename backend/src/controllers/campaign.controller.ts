import { Request, Response } from "express";
import { campaignService } from "../services/campaign.service";

export const campaignController = {
    /**
     * Create a new campaign
     */
    async createCampaign(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const campaign = await campaignService.createCampaign(userId, req.body);

            return res.status(201).json({
                success: true,
                message: "Campaign created successfully",
                data: campaign
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to create campaign"
            });
        }
    },

    /**
     * Update campaign
     */
    async updateCampaign(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { campaignId } = req.params;
            const campaign = await campaignService.updateCampaign(
                campaignId,
                userId,
                req.body
            );

            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Campaign updated successfully",
                data: campaign
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to update campaign"
            });
        }
    },

    /**
     * Get campaign by ID
     */
    async getCampaign(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { campaignId } = req.params;
            const campaign = await campaignService.getCampaignById(campaignId, userId);

            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: campaign
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to get campaign"
            });
        }
    },

    /**
     * Get all campaigns for user
     */
    async getUserCampaigns(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { status, limit, skip } = req.query;

            const result = await campaignService.getUserCampaigns(userId, {
                status: status as any,
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
                message: error.message || "Failed to get campaigns"
            });
        }
    },

    /**
     * Generate campaign script (Step 6)
     */
    async generateScript(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { campaignId } = req.params;
            const result = await campaignService.generateCampaignScript(campaignId, userId);

            return res.status(200).json({
                success: true,
                message: "Script generated successfully",
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to generate script"
            });
        }
    },

    /**
     * Start campaign generation (Step 7)
     */
    async startGeneration(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { campaignId } = req.params;
            const result = await campaignService.startCampaignGeneration(campaignId, userId);

            return res.status(200).json({
                success: true,
                message: "Campaign generation started",
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to start generation"
            });
        }
    },

    /**
     * Get campaign status
     */
    async getCampaignStatus(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { campaignId } = req.params;
            const result = await campaignService.getCampaignStatus(campaignId, userId);

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to get campaign status"
            });
        }
    },

    /**
     * Export campaign
     */
    async exportCampaign(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { campaignId } = req.params;
            const exportJob = await campaignService.exportCampaign(campaignId, userId);

            return res.status(200).json({
                success: true,
                message: "Export started",
                data: exportJob
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to export campaign"
            });
        }
    },

    /**
     * Delete campaign
     */
    async deleteCampaign(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { campaignId } = req.params;
            const deleted = await campaignService.deleteCampaign(campaignId, userId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Campaign not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Campaign deleted successfully"
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to delete campaign"
            });
        }
    }
};
