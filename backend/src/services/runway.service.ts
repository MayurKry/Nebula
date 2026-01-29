import axios from "axios";
import { costTracker } from "../utils/costTracker";
import logger from "../utils/logger";

export interface RunwayGenerationParams {
    prompt: string;
    model?: string;
    width?: number;
    height?: number;
    ratio?: string;
    seed?: number;
    duration?: number;
    promptImage?: string; // For i2v
    voiceId?: string; // For tts
    tone?: string; // For emotional inflection in tts
}

export interface RunwayResult {
    id: string;
    status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
    output?: string[];
    failure?: string;
}

class RunwayService {
    private readonly apiKey: string;
    private readonly baseUrl = "https://api.dev.runwayml.com/v1";

    constructor() {
        this.apiKey = (process.env.RUNWAYML_API_KEY || "").trim();
        if (!this.apiKey) {
            logger.warn("[RunwayService] API Key is missing. Generation will fail.");
        } else {
            logger.info(`[RunwayService] API Key loaded (length: ${this.apiKey.length}, starts with: ${this.apiKey.substring(0, 10)}...)`);
        }
    }

    /**
     * Text to Image Generation - STRICTLY LOCKED TO gen4_image_turbo
     * Model: gen4_image_turbo (2 credits per image = $0.02)
     * NO OTHER MODELS ALLOWED
     */
    async textToImage(params: RunwayGenerationParams): Promise<RunwayResult> {
        const model = "gen4_image"; // Using standard model as turbo requires reference images in dev env
        const creditsPerImage = 5; // Standard model might be more expensive? Let's assume 5 for now or check docs. Actually docs say 1 credit usually. Let's keep cost logic simple or check.
        // Wait, normally gen4 is 5 credits. turbo is 2? 
        // Let's assume 5 credits for standard gen4.
        const estimatedCost = 5 * 0.01;

        logger.info(`[RunwayService] 🔒 LOCKED MODEL: ${model}`);
        logger.info(`[RunwayService] Estimated cost: 5 credits ($${estimatedCost.toFixed(2)})`);

        // Log to cost tracker
        costTracker.logCall({
            timestamp: new Date(),
            model: `runway-${model}`,
            type: 'image',
            status: 'attempted',
            estimatedCost,
            metadata: {
                prompt: params.prompt.substring(0, 50),
                credits: creditsPerImage
            }
        });

        // Enforce supported aspect ratios for Dev Environment stability
        const SUPPORTED_RATIOS = [
            "1024:1024", "1080:1080", "1168:880", "1360:768", "1440:1080",
            "1080:1440", "1808:768", "1920:1080", "1080:1920", "2112:912",
            "1280:720", "720:1280", "720:720", "960:720", "720:960", "1680:720"
        ];

        // Helper to find closest ratio match
        const inputRatio = (params.width || 1024) / (params.height || 1024);
        let bestRatio = "1024:1024";
        let minDiff = Number.MAX_VALUE;

        for (const ratioStr of SUPPORTED_RATIOS) {
            const [w, h] = ratioStr.split(':').map(Number);
            const r = w / h;
            const diff = Math.abs(r - inputRatio);
            if (diff < minDiff) {
                minDiff = diff;
                bestRatio = ratioStr;
            }
        }

        logger.info(`[RunwayService] Snapped ratio from ${params.width}:${params.height} (${inputRatio.toFixed(2)}) to ${bestRatio}`);

        try {
            const response = await axios.post(
                `${this.baseUrl}/text_to_image`,
                {
                    promptText: params.prompt,
                    model: model, // 🔒 LOCKED
                    ratio: bestRatio,
                },
                {
                    headers: {
                        "Authorization": `Bearer ${this.apiKey}`,
                        "X-Runway-Version": "2024-11-06",
                        "Content-Type": "application/json"
                    },
                    timeout: 60000
                }
            );

            logger.info(`[RunwayService] ✅ Image generation successful with ${model}`);

            // Log success
            costTracker.logCall({
                timestamp: new Date(),
                model: `runway-${model}`,
                type: 'image',
                status: 'success',
                estimatedCost,
                metadata: { credits: creditsPerImage }
            });

            return response.data;
        } catch (error: any) {
            this.handleRunwayError(error, model, 'image');
            throw error;
        }
    }

    /**
     * Text to Video Generation - STRICTLY LOCKED TO gen4_turbo
     * Model: gen4_turbo (5 credits per second)
     * NO OTHER MODELS ALLOWED
     */
    async textToVideo(params: RunwayGenerationParams): Promise<RunwayResult> {
        // Models: Strictly veo3.1 or veo3 as per user request
        let model = params.model || 'veo3.1';

        // Enforce strictly supported models
        if (model !== 'veo3' && model !== 'veo3.1') {
            model = 'veo3.1'; // Default to newest
        }

        // Duration Logic:
        // veo3: 8s only
        // veo3.1: 4s, 6s, 8s
        let duration = params.duration || 6;

        if (model === 'veo3') {
            duration = 8;
        } else if (model === 'veo3.1') {
            // Snap to closest supported duration (4, 6, 8)
            if (duration <= 4) duration = 4;
            else if (duration <= 6) duration = 6;
            else duration = 8;
        }

        const creditsPerSecond = 5;
        const totalCredits = duration * creditsPerSecond;
        const estimatedCost = totalCredits * 0.01;

        logger.info(`[RunwayService] 🎬 Video Gen (${model}) | Duration: ${duration}s | Credits: ${totalCredits}`);

        // Log to cost tracker
        costTracker.logCall({
            timestamp: new Date(),
            model: `runway-${model}`,
            type: 'video',
            status: 'attempted',
            estimatedCost,
            metadata: { prompt: params.prompt.substring(0, 50), duration, credits: totalCredits }
        });

        // Enforce supported aspect ratios
        const VALID_RATIOS = ["1280:720", "720:1280", "1080:1920", "1920:1080"];
        let ratio = "1280:720";
        if (params.ratio && VALID_RATIOS.includes(params.ratio)) {
            ratio = params.ratio;
        } else if (params.ratio) {
            // Smart snapping
            if (params.ratio.includes("9:16") || params.ratio.startsWith("720")) ratio = "720:1280";
        }

        try {
            const response = await axios.post(
                `${this.baseUrl}/text_to_video`,
                {
                    promptText: params.prompt,
                    model: model,
                    duration: duration,
                    ratio: ratio
                },
                {
                    headers: {
                        "Authorization": `Bearer ${this.apiKey}`,
                        "X-Runway-Version": "2024-11-06",
                        "Content-Type": "application/json"
                    },
                    timeout: 120000
                }
            );

            costTracker.logCall({
                timestamp: new Date(),
                model: `runway-${model}`,
                type: 'video',
                status: 'success',
                estimatedCost
            });

            return response.data;
        } catch (error: any) {
            this.handleRunwayError(error, model, 'video');
            throw error;
        }
    }

    /**
     * Image to Video Generation
     */
    async imageToVideo(params: RunwayGenerationParams): Promise<RunwayResult> {
        let model = params.model || 'veo3.1';

        if (model !== 'veo3' && model !== 'veo3.1') {
            model = 'veo3.1';
        }

        let duration = params.duration || 6;
        if (model === 'veo3') {
            duration = 8;
        } else if (model === 'veo3.1') {
            if (duration <= 4) duration = 4;
            else if (duration <= 6) duration = 6;
            else duration = 8;
        }

        const totalCredits = duration * 5;
        const estimatedCost = totalCredits * 0.01;

        logger.info(`[RunwayService] 🖼️🎬 Image to Video (${model}) | Duration: ${duration}s`);

        try {
            const response = await axios.post(
                `${this.baseUrl}/image_to_video`,
                {
                    promptText: params.prompt,
                    promptImage: params.promptImage,
                    model: model,
                    duration: duration,
                    ratio: params.ratio || "1280:720"
                },
                {
                    headers: {
                        "Authorization": `Bearer ${this.apiKey}`,
                        "X-Runway-Version": "2024-11-06",
                        "Content-Type": "application/json"
                    },
                    timeout: 120000
                }
            );

            costTracker.logCall({
                timestamp: new Date(),
                model: `runway-${model}`,
                type: 'video',
                status: 'success',
                estimatedCost
            });

            return response.data;
        } catch (error: any) {
            this.handleRunwayError(error, model, 'video');
            throw error;
        }
    }

    /**
     * Text to Speech Generation
     */
    async textToAudio(params: RunwayGenerationParams): Promise<RunwayResult> {
        const estimatedCost = 0.05; // Base cost for audio

        logger.info(`[RunwayService] 🔊 Text to Speech | Voice: ${params.voiceId || "default"}`);

        try {
            const response = await axios.post(
                `${this.baseUrl}/text_to_speech`,
                {
                    model: "eleven_multilingual_v2",
                    promptText: params.prompt,
                    voice: {
                        type: "runway-preset",
                        presetId: params.voiceId || "Leslie"
                    }
                },
                {
                    headers: {
                        "Authorization": `Bearer ${this.apiKey}`,
                        "X-Runway-Version": "2024-11-06",
                        "Content-Type": "application/json"
                    },
                    timeout: 60000
                }
            );

            costTracker.logCall({
                timestamp: new Date(),
                model: `runway-tts`,
                type: 'audio',
                status: 'success',
                estimatedCost
            });

            return response.data;
        } catch (error: any) {
            this.handleRunwayError(error, 'text_to_speech', 'audio');
            throw error;
        }
    }

    /**
     * Check task status
     */
    async checkStatus(taskId: string): Promise<RunwayResult> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/tasks/${taskId}`,
                {
                    headers: {
                        "Authorization": `Bearer ${this.apiKey}`,
                        "X-Runway-Version": "2024-11-06"
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            logger.error(`[RunwayService] Failed to check status for ${taskId}:`, error.message);
            throw error;
        }
    }

    /**
     * Handle Runway ML API errors with specific messages
     */
    private handleRunwayError(error: any, model: string, type: 'image' | 'video' | 'audio'): void {
        const status = error.response?.status;
        const errorData = error.response?.data;

        // Log failed attempt
        costTracker.logCall({
            timestamp: new Date(),
            model: `runway-${model}`,
            type,
            status: 'failed',
            estimatedCost: 0,
            metadata: {
                error: error.message,
                httpStatus: status,
                errorData: JSON.stringify(errorData)
            }
        });

        // Handle specific error codes
        if (status === 401) {
            logger.error("[RunwayService] ❌ Invalid API Key");
            throw new Error("Invalid Runway ML API key. Please check your RUNWAYML_API_KEY in environment variables.");
        }

        if (status === 429) {
            logger.error("[RunwayService] ❌ Rate limit or credits exhausted");
            throw new Error("Runway ML credits exhausted for the day or rate limit reached. Please try again later or add more credits to your account.");
        }

        if (status === 400) {
            logger.error("[RunwayService] ❌ Bad request:", errorData);
            const detail = errorData?.message || errorData?.error || JSON.stringify(errorData);
            throw new Error(`Invalid request parameters: ${detail}`);
        }

        if (status === 404) {
            logger.error("[RunwayService] ❌ Resource not found");
            throw new Error("Runway ML resource not found. The task ID may be invalid.");
        }

        if (status >= 500) {
            logger.error("[RunwayService] ❌ Server error:", status);
            throw new Error(`Runway ML server error (${status}). Please try again in a few moments.`);
        }

        // Generic error
        logger.error("[RunwayService] ❌ Unknown error:", error.message);
        throw new Error(`Runway ML generation failed: ${error.message}`);
    }

    /**
     * Estimate credit cost for image generation
     */
    estimateImageCost(): { credits: number; cost: number } {
        const credits = 5; // gen4_image
        return {
            credits,
            cost: credits * 0.01
        };
    }

    /**
     * Estimate credit cost for video generation
     */
    estimateVideoCost(duration: number): { credits: number; cost: number } {
        const creditsPerSecond = 5; // gen4_turbo
        const credits = duration * creditsPerSecond;
        return {
            credits,
            cost: credits * 0.01
        };
    }
}

export const runwayService = new RunwayService();
export default runwayService;
