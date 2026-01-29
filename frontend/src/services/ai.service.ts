import axiosInstance from "@/api/axiosInstance";

export interface GenerateImageRequest {
    prompt: string;
    style?: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
    seed?: number;
    cameraAngle?: string;
}

export interface GenerateImageResponse {
    url: string;
    prompt: string;
    style?: string;
    width: number;
    height: number;
    seed?: number;
    provider?: string;
    generatedAt: string;
}

export interface GenerateImagesResponse {
    images: Array<{
        url: string;
        width: number;
        height: number;
        seed?: number;
        provider?: string;
    }>;
    prompt: string;
    style?: string;
    count: number;
    provider?: string;
    generatedAt: string;
}

export interface GenerateVideoRequest {
    prompt: string;
    model?: string;
    style?: string;
    duration?: number;
}

export interface GenerateVideoResponse {
    jobId: string;
    prompt: string;
    style?: string;
    duration: number;
    status: string;
    estimatedTime: number;
    thumbnailUrl: string;
}

export interface VideoStatusResponse {
    jobId: string;
    status: 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    thumbnailUrl?: string;
    progress?: number;
}

export interface VideoProjectScene {
    id: string;
    order: number;
    description: string;
    imageUrl: string;
    duration: number;
    type: string;
    cameraPath: string;
    motionIntensity?: number;
    assignedCharacterId?: string | null;
}

export interface VideoProjectAudio {
    trackName: string;
    duration: number;
    url: string;
}

export interface VideoProjectCharacter {
    id: string;
    name: string;
    avatarUrl: string;
    voiceId: string;
    accent: string;
    region: string;
}

export interface VideoProjectTrack {
    id: string;
    type: 'video' | 'voice' | 'music' | 'sfx';
    name: string;
    startTime: number;
    duration: number;
    url: string;
    volume: number;
    characterId?: string;
}

export interface GenerateVideoProjectResponse {
    projectId: string;
    prompt: string;
    settings: {
        style: string;
        duration: number;
        language?: string;
        region?: string;
        aspectRatio?: string;
    };
    script: string;
    scenes: VideoProjectScene[];
    characters?: VideoProjectCharacter[];
    tracks?: VideoProjectTrack[];
    // Deprecated but kept for compatibility for now if needed, or remove if fully migrated
    audio?: VideoProjectAudio;
    createdAt: string;
}


export interface GenerateStoryboardRequest {
    script: string;
    scenes?: number;
}

export interface StoryboardScene {
    sceneNumber: number;
    description: string;
    imageUrl: string;
    duration: number;
    cameraAngle: string;
}

export interface HistoryItem {
    id: string;
    type: 'image' | 'video' | 'video-project' | 'audio';
    prompt: string;
    settings: {
        style?: string;
        width?: number;
        height?: number;
        aspectRatio?: string;
        duration?: number;
        seed?: number;
        cameraAngle?: string;
        negativePrompt?: string;
        count?: number;
    };
    results: Array<{
        assetId?: string;
        url: string;
        thumbnailUrl?: string;
        provider?: string;
        jobId?: string;
        status?: string;
    }>;
    provider?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    createdAt: string;
}

export interface GenerateStoryboardResponse {
    scenes: StoryboardScene[];
    totalDuration: number;
}

class AIService {
    /**
     * Generate an image from a text prompt
     */
    async generateImage(data: GenerateImageRequest): Promise<GenerateImageResponse> {
        const { aspectRatio, ...requestData } = data;

        // Convert aspect ratio to width/height if provided
        let width = requestData.width || 1024;
        let height = requestData.height || 1024;

        if (aspectRatio) {
            const ratioMap: Record<string, { width: number; height: number }> = {
                '16:9': { width: 1360, height: 768 },
                '9:16': { width: 720, height: 1280 },
                '1:1': { width: 1024, height: 1024 },
                '4:3': { width: 1440, height: 1080 },
                '3:4': { width: 1080, height: 1440 },
            };

            if (ratioMap[aspectRatio]) {
                width = ratioMap[aspectRatio].width;
                height = ratioMap[aspectRatio].height;
            }
        }

        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: GenerateImageResponse;
        }>('/ai/generate-image', {
            ...requestData,
            width,
            height,
        });

        return response.data.data;
    }

    /**
     * Generate multiple images from a text prompt
     */
    async generateImages(
        data: GenerateImageRequest,
        count: number = 1
    ): Promise<GenerateImageResponse[]> {
        const { aspectRatio, ...requestData } = data;

        // Convert aspect ratio to width/height if provided
        let width = requestData.width || 1024;
        let height = requestData.height || 1024;

        if (aspectRatio) {
            const ratioMap: Record<string, { width: number; height: number }> = {
                '16:9': { width: 1360, height: 768 },
                '9:16': { width: 720, height: 1280 },
                '1:1': { width: 1024, height: 1024 },
                '4:3': { width: 1440, height: 1080 },
                '3:4': { width: 1080, height: 1440 },
            };

            if (ratioMap[aspectRatio]) {
                width = ratioMap[aspectRatio].width;
                height = ratioMap[aspectRatio].height;
            }
        }

        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: GenerateImagesResponse;
        }>('/ai/generate-image', {
            ...requestData,
            width,
            height,
            count,
        });

        // Map the response to match the expected format
        return response.data.data.images.map(img => ({
            url: img.url,
            prompt: response.data.data.prompt,
            style: response.data.data.style,
            width: img.width,
            height: img.height,
            seed: img.seed,
            provider: img.provider,
            generatedAt: response.data.data.generatedAt,
        }));
    }

    /**
     * Generate a video from a text prompt
     */
    async generateVideo(data: GenerateVideoRequest): Promise<GenerateVideoResponse> {
        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: GenerateVideoResponse;
        }>('/ai/generate-video', data);

        return response.data.data;
    }

    /**
     * Check the status of a video generation job
     */
    async checkVideoStatus(jobId: string): Promise<VideoStatusResponse> {
        const response = await axiosInstance.get<{
            success: boolean;
            message: string;
            data: VideoStatusResponse;
        }>(`/ai/video-status/${jobId}`);

        return response.data.data;
    }

    /**
     * Generate a full video project (script, scenes, audio)
     */
    async generateVideoProject(data: GenerateVideoRequest): Promise<GenerateVideoProjectResponse> {
        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: GenerateVideoProjectResponse;
        }>('/ai/generate-video-project', data);

        return response.data.data;
    }


    /**
     * Generate a storyboard from a script
     */
    async generateStoryboard(data: GenerateStoryboardRequest): Promise<GenerateStoryboardResponse> {
        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: GenerateStoryboardResponse;
        }>('/ai/generate-storyboard', data);

        return response.data.data;
    }

    /**
     * Regenerate a single scene image
     */
    async regenerateScene(description: string, style: string): Promise<{ imageUrl: string; provider?: string }> {
        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: { imageUrl: string; provider?: string };
        }>('/ai/regenerate-scene', { description, style });

        return response.data.data;
    }

    /**
     * Animate a scene image
     */
    async animateScene(imageUrl: string, prompt?: string, params?: any): Promise<VideoStatusResponse> {
        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: VideoStatusResponse;
        }>('/ai/animate-scene', { imageUrl, prompt, ...params });

        return response.data.data;
    }

    /**
     * Get available AI providers
     */
    async getAIProviders(): Promise<{
        providers: string[];
        total: number;
        primary: string;
    }> {
        const response = await axiosInstance.get<{
            success: boolean;
            message: string;
            data: {
                providers: string[];
                total: number;
                primary: string;
            };
        }>('/ai/providers');

        return response.data.data;
    }

    /**
     * Get User's Generation History
     */
    async getHistory(params?: { type?: string; limit?: number; skip?: number }): Promise<{
        history: HistoryItem[];
        total: number;
        limit: number;
        skip: number;
    }> {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.append('type', params.type);
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.skip) queryParams.append('skip', params.skip.toString());

        const response = await axiosInstance.get<{
            success: boolean;
            message: string;
            data: {
                history: HistoryItem[];
                total: number;
                limit: number;
                skip: number;
            };
        }>(`/ai/history?${queryParams.toString()}`);

        return response.data.data;
    }

    /**
     * Get Single History Item Details
     */
    async getHistoryItem(id: string): Promise<HistoryItem> {
        const response = await axiosInstance.get<{
            success: boolean;
            message: string;
            data: HistoryItem;
        }>(`/ai/history/${id}`);

        return response.data.data;
    }

    /**
     * Enhance a prompt using AI
     */
    async enhancePrompt(prompt: string): Promise<{ original: string; enhanced: string }> {
        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: { original: string; enhanced: string };
        }>('/ai/enhance-prompt', { prompt });

        return response.data.data;
    }
    /**
     * Generate audio (Text-to-Speech)
     */
    async generateAudio(data: { prompt: string; voiceId?: string }): Promise<{ jobId: string; status: string }> {
        const response = await axiosInstance.post<{
            success: boolean;
            message: string;
            data: { jobId: string; status: string };
        }>('/ai/generate-audio', data);

        return response.data.data;
    }

    /**
     * Check audio status
     */
    async checkAudioStatus(jobId: string): Promise<{ jobId: string; status: string; audioUrl?: string; error?: string }> {
        const response = await axiosInstance.get<{
            success: boolean;
            message: string;
            data: { jobId: string; status: string; audioUrl?: string; error?: string };
        }>(`/ai/audio-status/${jobId}`);

        return response.data.data;
    }
}

export const aiService = new AIService();
export default aiService;

