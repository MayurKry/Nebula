
import axiosInstance from '@/api/axiosInstance';

export interface Asset {
    _id: string;
    name: string;
    type: 'image' | 'video' | 'audio' | 'storyboard' | 'document';
    url: string;
    thumbnailUrl?: string;
    fileSize?: number;
    duration?: number;
    dimensions?: {
        width: number;
        height: number;
    };
    folderId?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateAssetData {
    name: string;
    type: Asset['type'];
    url: string;
    thumbnailUrl?: string;
    duration?: number;
    dimensions?: {
        width: number;
        height: number;
    };
    fileSize?: number;
    folderId?: string;
    tags?: string[];
}

class AssetService {
    async getAssets(params?: { type?: string; folderId?: string; search?: string; limit?: number; page?: number }): Promise<{ assets: Asset[]; total: number }> {
        const response = await axiosInstance.get('/assets', { params });
        return response.data.data;
    }

    async getAsset(id: string): Promise<Asset> {
        const response = await axiosInstance.get(`/assets/${id}`);
        return response.data.data;
    }

    async createAsset(data: CreateAssetData): Promise<Asset> {
        const response = await axiosInstance.post('/assets', data);
        return response.data.data;
    }

    async updateAsset(id: string, data: Partial<CreateAssetData>): Promise<Asset> {
        const response = await axiosInstance.patch(`/assets/${id}`, data);
        return response.data.data;
    }

    async deleteAsset(id: string): Promise<void> {
        await axiosInstance.delete(`/assets/${id}`);
    }

    async searchAssets(query: string): Promise<Asset[]> {
        const response = await axiosInstance.get('/assets/search', { params: { q: query } });
        return response.data;
    }

    async downloadAsset(id: string): Promise<Blob> {
        const response = await axiosInstance.get(`/assets/download/${id}`, {
            responseType: 'blob'
        });
        return response.data;
    }
}

export const assetService = new AssetService();
