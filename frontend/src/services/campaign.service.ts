import axiosInstance from '@/api/axiosInstance';

export interface CampaignAsset {
    type: "image" | "video";
    jobId: string;
    url?: string;
    status: "pending" | "generating" | "completed" | "failed";
    metadata?: Record<string, any>;
}

export interface Campaign {
    _id: string;
    userId: string;

    // Step 1
    name: string;
    objective: "Brand Awareness" | "Product Promotion" | "Lead Generation" | "App Installs";
    platforms: string[];

    // Step 2
    country: string;
    language: string;
    audienceType: "B2C" | "B2B";
    audienceDescription?: string;

    // Step 3
    brandName: string;
    brandTone?: string;
    brandLogo?: string;
    brandImages?: string[];
    primaryColor?: string;

    // Step 4
    productName?: string;
    productLink?: string;
    productDescription?: string;
    cta: string;

    // Step 5
    contentType: "video" | "image" | "both";
    videoDuration?: 6 | 15 | 30;
    visualStyle?: string;
    aspectRatios?: Record<string, string>;

    // Step 6
    generatedScript?: string;
    sceneOutline?: string[];

    // Assets
    assets: CampaignAsset[];

    // Status
    status: "draft" | "generating" | "completed" | "failed";

    // Jobs
    jobIds: string[];

    createdAt: string;
    updatedAt: string;
}

export interface CampaignProgress {
    total: number;
    completed: number;
    failed: number;
    processing: number;
}

class CampaignService {
    /**
     * Create a new campaign
     */
    async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
        const response = await axiosInstance.post('/campaigns', data);
        return response.data.data;
    }

    /**
     * Update campaign
     */
    async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
        const response = await axiosInstance.put(`/campaigns/${campaignId}`, updates);
        return response.data.data;
    }

    /**
     * Get campaign by ID
     */
    async getCampaign(campaignId: string): Promise<Campaign> {
        const response = await axiosInstance.get(`/campaigns/${campaignId}`);
        return response.data.data;
    }

    /**
     * Get all campaigns
     */
    async getUserCampaigns(filters?: {
        status?: Campaign['status'];
        limit?: number;
        skip?: number;
    }): Promise<{ campaigns: Campaign[]; total: number }> {
        const params: any = {};
        if (filters?.status) params.status = filters.status;
        if (filters?.limit) params.limit = filters.limit;
        if (filters?.skip) params.skip = filters.skip;

        const response = await axiosInstance.get('/campaigns', { params });
        return response.data.data;
    }

    /**
     * Generate campaign script (Step 6)
     */
    async generateScript(campaignId: string): Promise<{
        script: string;
        sceneOutline: string[];
    }> {
        const response = await axiosInstance.post(`/campaigns/${campaignId}/generate-script`, {});
        return response.data.data;
    }

    /**
     * Start campaign generation (Step 7)
     */
    async startGeneration(campaignId: string): Promise<{
        campaign: Campaign;
        jobs: any[];
    }> {
        const response = await axiosInstance.post(`/campaigns/${campaignId}/start-generation`, {});
        return response.data.data;
    }

    /**
     * Get campaign status
     */
    async getCampaignStatus(campaignId: string): Promise<{
        campaign: Campaign;
        jobs: any[];
        progress: CampaignProgress;
    }> {
        const response = await axiosInstance.get(`/campaigns/${campaignId}/status`);
        return response.data.data;
    }

    /**
     * Export campaign
     */
    async exportCampaign(campaignId: string): Promise<any> {
        const response = await axiosInstance.post(`/campaigns/${campaignId}/export`, {});
        return response.data.data;
    }

    /**
     * Delete campaign
     */
    async deleteCampaign(campaignId: string): Promise<void> {
        await axiosInstance.delete(`/campaigns/${campaignId}`);
    }

    /**
     * Cancel campaign generation
     */
    async cancelGeneration(campaignId: string): Promise<void> {
        await axiosInstance.post(`/campaigns/${campaignId}/cancel`, {});
    }
}

export const campaignService = new CampaignService();
export default campaignService;
