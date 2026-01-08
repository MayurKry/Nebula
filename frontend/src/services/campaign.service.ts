import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/v1';

// Get auth token
const getAuthToken = () => {
    const token = localStorage.getItem('accessToken');
    return token;
};

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
    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        };
    }

    /**
     * Create a new campaign
     */
    async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
        const response = await axios.post(
            `${API_BASE_URL}/campaigns`,
            data,
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }

    /**
     * Update campaign
     */
    async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
        const response = await axios.put(
            `${API_BASE_URL}/campaigns/${campaignId}`,
            updates,
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }

    /**
     * Get campaign by ID
     */
    async getCampaign(campaignId: string): Promise<Campaign> {
        const response = await axios.get(
            `${API_BASE_URL}/campaigns/${campaignId}`,
            { headers: this.getHeaders() }
        );
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
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.skip) params.append('skip', filters.skip.toString());

        const response = await axios.get(
            `${API_BASE_URL}/campaigns?${params.toString()}`,
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }

    /**
     * Generate campaign script (Step 6)
     */
    async generateScript(campaignId: string): Promise<{
        script: string;
        sceneOutline: string[];
    }> {
        const response = await axios.post(
            `${API_BASE_URL}/campaigns/${campaignId}/generate-script`,
            {},
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }

    /**
     * Start campaign generation (Step 7)
     */
    async startGeneration(campaignId: string): Promise<{
        campaign: Campaign;
        jobs: any[];
    }> {
        const response = await axios.post(
            `${API_BASE_URL}/campaigns/${campaignId}/start-generation`,
            {},
            { headers: this.getHeaders() }
        );
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
        const response = await axios.get(
            `${API_BASE_URL}/campaigns/${campaignId}/status`,
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }

    /**
     * Export campaign
     */
    async exportCampaign(campaignId: string): Promise<any> {
        const response = await axios.post(
            `${API_BASE_URL}/campaigns/${campaignId}/export`,
            {},
            { headers: this.getHeaders() }
        );
        return response.data.data;
    }

    /**
     * Delete campaign
     */
    async deleteCampaign(campaignId: string): Promise<void> {
        await axios.delete(
            `${API_BASE_URL}/campaigns/${campaignId}`,
            { headers: this.getHeaders() }
        );
    }
}

export const campaignService = new CampaignService();
export default campaignService;
