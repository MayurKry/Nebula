import { CampaignModel, ICampaign } from "../models/campaign.model";
import { jobService } from "./job.service";
import mongoose from "mongoose";
import logger from "../utils/logger";

class CampaignService {
    /**
     * Create a new campaign (draft)
     */
    async createCampaign(userId: string, data: Partial<ICampaign>): Promise<ICampaign> {
        try {
            const campaign = await CampaignModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                ...data,
                status: "draft",
                assets: [],
                jobIds: []
            });

            logger.info(`Campaign created: ${campaign._id}`);
            return campaign;
        } catch (error: any) {
            logger.error("Failed to create campaign:", error);
            throw new Error("Failed to create campaign");
        }
    }

    /**
     * Update campaign
     */
    async updateCampaign(
        campaignId: string,
        userId: string,
        updates: Partial<ICampaign>
    ): Promise<ICampaign | null> {
        try {
            const campaign = await CampaignModel.findOneAndUpdate(
                {
                    _id: campaignId,
                    userId: new mongoose.Types.ObjectId(userId)
                },
                updates,
                { new: true }
            );

            return campaign;
        } catch (error: any) {
            logger.error("Failed to update campaign:", error);
            return null;
        }
    }

    /**
     * Get campaign by ID
     */
    async getCampaignById(campaignId: string, userId: string): Promise<ICampaign | null> {
        try {
            const campaign = await CampaignModel.findOne({
                _id: campaignId,
                userId: new mongoose.Types.ObjectId(userId)
            }).populate("jobIds");

            return campaign;
        } catch (error: any) {
            logger.error("Failed to get campaign:", error);
            return null;
        }
    }

    /**
     * Get all campaigns for a user
     */
    async getUserCampaigns(
        userId: string,
        filters?: {
            status?: ICampaign["status"];
            limit?: number;
            skip?: number;
        }
    ): Promise<{ campaigns: ICampaign[]; total: number }> {
        try {
            const query: any = { userId: new mongoose.Types.ObjectId(userId) };

            if (filters?.status) query.status = filters.status;

            const total = await CampaignModel.countDocuments(query);
            const campaigns = await CampaignModel.find(query)
                .sort({ createdAt: -1 })
                .limit(filters?.limit || 20)
                .skip(filters?.skip || 0);

            return { campaigns, total };
        } catch (error: any) {
            logger.error("Failed to get user campaigns:", error);
            throw new Error("Failed to get user campaigns");
        }
    }

    /**
     * Generate AI script and scene outline (Step 6)
     */
    async generateCampaignScript(campaignId: string, userId: string): Promise<{
        script: string;
        sceneOutline: string[];
    }> {
        try {
            const campaign = await this.getCampaignById(campaignId, userId);
            if (!campaign) {
                throw new Error("Campaign not found");
            }

            // Create a job for script generation
            const job = await jobService.createJob({
                userId,
                module: "campaign_wizard",
                input: {
                    campaignId,
                    config: {
                        step: "script_generation",
                        campaignData: {
                            name: campaign.name,
                            objective: campaign.objective,
                            brandName: campaign.brandName,
                            productName: campaign.productName,
                            cta: campaign.cta,
                            audienceDescription: campaign.audienceDescription
                        }
                    }
                }
            });

            // Generate mock script for demo
            const script = this.generateMockScript(campaign);
            const sceneOutline = this.generateMockSceneOutline(campaign);

            // Update campaign with generated content
            await this.updateCampaign(campaignId, userId, {
                generatedScript: script,
                sceneOutline
            });

            return { script, sceneOutline };
        } catch (error: any) {
            logger.error("Failed to generate campaign script:", error);
            throw error;
        }
    }

    /**
     * Start campaign generation (Step 7)
     */
    async startCampaignGeneration(campaignId: string, userId: string): Promise<{
        campaign: ICampaign;
        jobs: any[];
    }> {
        try {
            const campaign = await this.getCampaignById(campaignId, userId);
            if (!campaign) {
                throw new Error("Campaign not found");
            }

            // Update campaign status
            await this.updateCampaign(campaignId, userId, { status: "generating" });

            const jobs = [];
            const assets: ICampaign["assets"] = [];

            // Create jobs based on content type and platforms
            if (campaign.contentType === "image" || campaign.contentType === "both") {
                // Create image generation jobs for each platform
                for (const platform of campaign.platforms) {
                    const imageJob = await jobService.createJob({
                        userId,
                        module: "text_to_image",
                        input: {
                            campaignId,
                            prompt: this.generatePromptForPlatform(campaign, platform, "image"),
                            config: {
                                platform,
                                aspectRatio: this.getAspectRatioForPlatform(platform),
                                style: campaign.visualStyle || "Photorealistic"
                            }
                        },
                        metadata: {
                            campaignId,
                            platform,
                            assetType: "image"
                        }
                    });

                    jobs.push(imageJob);
                    assets.push({
                        type: "image",
                        jobId: imageJob._id,
                        status: "generating",
                        metadata: { platform }
                    });
                }
            }

            if (campaign.contentType === "video" || campaign.contentType === "both") {
                // Create video generation jobs for each platform
                for (const platform of campaign.platforms) {
                    const videoJob = await jobService.createJob({
                        userId,
                        module: "text_to_video",
                        input: {
                            campaignId,
                            prompt: this.generatePromptForPlatform(campaign, platform, "video"),
                            config: {
                                platform,
                                duration: campaign.videoDuration || 15,
                                aspectRatio: this.getAspectRatioForPlatform(platform),
                                style: campaign.visualStyle || "Cinematic"
                            }
                        },
                        metadata: {
                            campaignId,
                            platform,
                            assetType: "video"
                        }
                    });

                    jobs.push(videoJob);
                    assets.push({
                        type: "video",
                        jobId: videoJob._id,
                        status: "generating",
                        metadata: { platform }
                    });
                }
            }

            // Update campaign with jobs and assets
            const updatedCampaign = await this.updateCampaign(campaignId, userId, {
                jobIds: jobs.map(j => j._id),
                assets
            });

            return {
                campaign: updatedCampaign!,
                jobs
            };
        } catch (error: any) {
            logger.error("Failed to start campaign generation:", error);
            throw error;
        }
    }

    /**
     * Check campaign generation status
     */
    async getCampaignStatus(campaignId: string, userId: string): Promise<{
        campaign: ICampaign;
        jobs: any[];
        progress: {
            total: number;
            completed: number;
            failed: number;
            processing: number;
        };
    }> {
        try {
            const campaign = await this.getCampaignById(campaignId, userId);
            if (!campaign) {
                throw new Error("Campaign not found");
            }

            // Get all jobs for this campaign
            const { jobs } = await jobService.getUserJobs(userId, {
                limit: 100
            });

            const campaignJobs = jobs.filter(job =>
                campaign.jobIds.some(id => id.toString() === job._id.toString())
            );

            // Calculate progress
            const progress = {
                total: campaignJobs.length,
                completed: campaignJobs.filter(j => j.status === "completed").length,
                failed: campaignJobs.filter(j => j.status === "failed").length,
                processing: campaignJobs.filter(j => j.status === "processing" || j.status === "queued").length
            };

            // Update campaign status if all jobs are done
            if (progress.processing === 0 && progress.total > 0) {
                const newStatus = progress.failed === progress.total ? "failed" : "completed";
                await this.updateCampaign(campaignId, userId, { status: newStatus });
            }

            return {
                campaign,
                jobs: campaignJobs,
                progress
            };
        } catch (error: any) {
            logger.error("Failed to get campaign status:", error);
            throw error;
        }
    }

    /**
     * Export campaign assets
     */
    async exportCampaign(campaignId: string, userId: string): Promise<any> {
        try {
            const campaign = await this.getCampaignById(campaignId, userId);
            if (!campaign) {
                throw new Error("Campaign not found");
            }

            // Create export job
            const exportJob = await jobService.createJob({
                userId,
                module: "export",
                input: {
                    campaignId,
                    assetIds: campaign.assets.map(a => a.jobId?.toString()).filter(Boolean) as string[]
                },
                metadata: {
                    campaignName: campaign.name
                }
            });

            return exportJob;
        } catch (error: any) {
            logger.error("Failed to export campaign:", error);
            throw error;
        }
    }

    /**
     * Delete campaign
     */
    async deleteCampaign(campaignId: string, userId: string): Promise<boolean> {
        try {
            const result = await CampaignModel.deleteOne({
                _id: campaignId,
                userId: new mongoose.Types.ObjectId(userId)
            });

            return result.deletedCount > 0;
        } catch (error: any) {
            logger.error("Failed to delete campaign:", error);
            return false;
        }
    }

    // Helper methods

    private generateMockScript(campaign: ICampaign): string {
        return `[Opening Scene]
Welcome to ${campaign.brandName}${campaign.productName ? ` - ${campaign.productName}` : ''}!

[Main Message]
${campaign.audienceDescription ? `For ${campaign.audienceDescription}, ` : ''}we bring you the perfect solution for ${campaign.objective.toLowerCase()}.

${campaign.productDescription || 'Experience innovation like never before.'}

[Call to Action]
${campaign.cta} today and transform your ${campaign.audienceType === 'B2C' ? 'lifestyle' : 'business'}!

[Closing]
${campaign.brandName} - ${campaign.brandTone || 'Your trusted partner'}.`;
    }

    private generateMockSceneOutline(campaign: ICampaign): string[] {
        const scenes = [
            `Opening: ${campaign.brandName} logo with dynamic animation`,
            `Scene 1: ${campaign.productName || 'Product'} showcase in ${campaign.visualStyle || 'modern'} style`,
            `Scene 2: Target audience (${campaign.audienceDescription}) using the product`,
            `Scene 3: Key benefits highlight with ${campaign.brandTone || 'professional'} tone`
        ];

        if (campaign.productLink) {
            scenes.push(`Scene 4: QR code or link display for ${campaign.productLink}`);
        }

        scenes.push(`Closing: ${campaign.cta} with brand colors`);

        return scenes;
    }

    private generatePromptForPlatform(
        campaign: ICampaign,
        platform: string,
        type: "image" | "video"
    ): string {
        const parts = [
            `Create a ${campaign.visualStyle || 'professional'} ${type} for ${platform}`,
            `featuring ${campaign.brandName}`,
            campaign.productName ? `promoting ${campaign.productName}` : '',
            `with ${campaign.brandTone || 'modern'} tone`,
            `targeting ${campaign.audienceDescription || campaign.audienceType + ' audience'}`,
            `for ${campaign.objective}`,
            campaign.primaryColor ? `using brand color ${campaign.primaryColor}` : '',
            `with call-to-action: ${campaign.cta}`
        ];

        return parts.filter(Boolean).join(', ') + '. High quality, engaging, professional.';
    }

    private getAspectRatioForPlatform(platform: string): string {
        const ratios: Record<string, string> = {
            "Instagram": "1:1",
            "Facebook": "16:9",
            "YouTube": "16:9",
            "TikTok": "9:16",
            "LinkedIn": "16:9",
            "Twitter": "16:9"
        };
        return ratios[platform] || "16:9";
    }
}

export const campaignService = new CampaignService();
export default campaignService;
