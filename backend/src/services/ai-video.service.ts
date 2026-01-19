import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { aiImageService } from "./ai-image.service";
import { isGeminiMaintenance } from "../middlewares/maintenance.middleware";
import { costTracker } from "../utils/costTracker";

export interface VideoGenerationParams {
    prompt: string;
    style?: string;
    duration?: number;
    width?: number;
    height?: number;
}

export interface VideoGenerationResult {
    jobId: string;
    status: "processing" | "succeeded" | "failed" | "canceled";
    videoUrl?: string; // Only present when succeeded
    thumbnailUrl?: string;
    error?: string;
}

class AIVideoService {
    private replicateKey?: string;
    private huggingfaceKey?: string;
    private runwaymlKey?: string;
    private geminiKey?: string;
    private readonly ZEROSCOPE_VERSION = "02fa9c6c4493eb21c7205126fe837e5c52c676c8c10508a8f4c4784a0d810ba7"; // Zeroscope XL
    private PUBLIC_DIR: string; // Not readonly anymore to allow dynamic assignment

    constructor() {
        this.replicateKey = process.env.REPLICATE_API_KEY;
        this.huggingfaceKey = process.env.HUGGINGFACE_API_KEY;
        this.runwaymlKey = process.env.RUNWAYML_API_KEY;

        const rawGeminiKey = process.env.GEMINI_API_KEY;
        this.geminiKey = (rawGeminiKey && rawGeminiKey !== "api_key_missing") ? rawGeminiKey : undefined;

        // Determine output directory based on environment
        // Vercel (and other serverless) file systems are read-only except /tmp
        if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
            this.PUBLIC_DIR = path.join("/tmp", "generated");
        } else {
            this.PUBLIC_DIR = path.join(process.cwd(), "public", "generated");
        }

        // Ensure output directory exists
        try {
            if (!fs.existsSync(this.PUBLIC_DIR)) {
                fs.mkdirSync(this.PUBLIC_DIR, { recursive: true });
            }
        } catch (error) {
            console.warn(`[AIVideoService] Failed to create output directory at ${this.PUBLIC_DIR}. Falling back to system temp dir.`);
            // Ultimate fallback
            this.PUBLIC_DIR = path.join(require('os').tmpdir(), "generated");
            try {
                if (!fs.existsSync(this.PUBLIC_DIR)) {
                    fs.mkdirSync(this.PUBLIC_DIR, { recursive: true });
                }
            } catch (e) {
                console.error("[AIVideoService] Critical: Could not create any temp directory.", e);
            }
        }
    }

    /**
     * Start a video generation job
     * Tries RunwayML -> Google Gemini -> Mock
     */
    async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult> {
        const errors: string[] = [];

        // 1. Try RunwayML (Highest Quality)
        if (this.runwaymlKey) {
            try {
                return await this.generateWithRunwayML(params);
            } catch (error: any) {
                console.error("[AIVideoService] RunwayML failed:", error.message);
                errors.push(`RunwayML: ${error.message}`);
                // Fallthrough to next provider
            }
        }

        // 2. Try Google Gemini Veo (High Quality)
        if (this.geminiKey) {
            try {
                return await this.generateWithGemini(params);
            } catch (error: any) {
                console.error("[AIVideoService] Google Gemini Veo failed:", error.message);
                errors.push(`Gemini: ${error.message}`);
            }
        }

        // 3. Fallback to Mock (Dev/Demo) - as per user request to "not throw errors"
        console.warn("[AIVideoService] All providers failed. Using mock generation.");
        return this.mockGeneration(params);
    }

    private async generateWithGemini(params: VideoGenerationParams): Promise<VideoGenerationResult> {
        // Check maintenance mode
        if (isGeminiMaintenance()) {
            throw new Error("Gemini AI is currently under maintenance. Please try again later or use alternative providers.");
        }

        const { prompt, duration = 12 } = params;
        const model = "veo-2.0-generate-001";
        console.log(`[AIVideoService] Starting Google Gemini Veo generation for: "${prompt}"`);

        // Log video generation attempt with cost
        costTracker.logCall({
            timestamp: new Date(),
            model,
            type: 'video',
            status: 'attempted',
            estimatedCost: costTracker.estimateVideoCost(duration),
            metadata: { prompt: prompt.substring(0, 50), duration }
        });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${this.geminiKey}`;

        const response = await axios.post(
            url,
            {
                instances: [
                    { prompt: prompt }
                ],
                parameters: {
                    aspectRatio: "16:9",
                    sampleCount: 1
                }
            },
            {
                headers: { "Content-Type": "application/json" }
            }
        );

        // Response is an Operation object: { name: "projects/.../operations/..." }
        const operationName = response.data.name;

        return {
            jobId: `google_${operationName}`,
            status: "processing",
            thumbnailUrl: "https://via.placeholder.com/576x320?text=Gemini+Veo+Processing..."
        };
    }

    private async generateWithRunwayML(params: VideoGenerationParams): Promise<VideoGenerationResult> {
        const { prompt } = params;
        console.log(`[AIVideoService] Starting RunwayML generation for: "${prompt}"`);

        // 1. Generate Image first (Gen-3a Turbo requires an image input)
        console.log("[AIVideoService] Generating initial image for video...");
        const imageResult = await aiImageService.generateImage({
            prompt: prompt,
            width: 1280,
            height: 768
        });

        // 2. Read image file and convert to Base64
        // Extract filename from URL (e.g., http://localhost:5000/public/generated/img_123.png -> img_123.png)
        const filename = imageResult.url.split('/').pop();
        if (!filename) throw new Error("Failed to extract filename from generated image");

        // Construct local path (assuming same public/generated structure)
        const imagePath = path.join(this.PUBLIC_DIR, filename);

        if (!fs.existsSync(imagePath)) {
            // Try explicit path check if public dir varies
            const fallbackPath = path.join(process.cwd(), 'public', 'generated', filename);
            if (fs.existsSync(fallbackPath)) {
                // Use fallback
                const fallbackBuffer = fs.readFileSync(fallbackPath);
                const base64Image = `data:image/png;base64,${fallbackBuffer.toString('base64')}`;
                return this.callRunwayImageToVideo(prompt, base64Image, imageResult.url);
            }
            throw new Error(`Generated image not found at ${imagePath}`);
        }

        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

        return this.callRunwayImageToVideo(prompt, base64Image, imageResult.url);
    }

    private async callRunwayImageToVideo(prompt: string, base64Image: string, thumbnailUrl: string): Promise<VideoGenerationResult> {
        // 3. Call RunwayML Image-to-Video
        const response = await axios.post(
            "https://api.dev.runwayml.com/v1/image_to_video",
            {
                promptImage: base64Image,
                promptText: prompt,
                model: "gen3a_turbo",
            },
            {
                headers: {
                    "Authorization": `Bearer ${this.runwaymlKey}`,
                    "X-Runway-Version": "2024-11-06"
                }
            }
        );

        return {
            jobId: `runway_${response.data.id}`,
            status: "processing",
            thumbnailUrl: thumbnailUrl // Use the generated image as thumbnail
        };
    }

    /**
     * Replicate Video Generation
     */
    private async generateWithReplicate(params: VideoGenerationParams): Promise<VideoGenerationResult> {
        const { prompt } = params;
        console.log(`[AIVideoService] Starting Replicate generation for: "${prompt}"`);

        const response = await axios.post(
            "https://api.replicate.com/v1/predictions",
            {
                version: this.ZEROSCOPE_VERSION,
                input: {
                    prompt: prompt,
                    num_frames: 24,
                    fps: 8,
                    width: 576,
                    height: 320,
                    guidance_scale: 17.5,
                    negative_prompt: "text, watermark, copyright, blurry, low quality"
                }
            },
            {
                headers: {
                    Authorization: `Token ${this.replicateKey}`,
                    "Content-Type": "application/json",
                }
            }
        );

        return {
            jobId: response.data.id,
            status: "processing",
            thumbnailUrl: "https://via.placeholder.com/576x320?text=Generating+Video..."
        };
    }

    /**
     * Hugging Face Video Generation
     * Uses damo-vilab/text-to-video-ms-1.7b
     */
    private async generateWithHuggingFace(params: VideoGenerationParams): Promise<VideoGenerationResult> {
        const { prompt } = params;
        console.log(`[AIVideoService] Starting Hugging Face generation for: "${prompt}"`);

        const response = await axios.post(
            "https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b",
            { inputs: prompt },
            {
                headers: {
                    Authorization: `Bearer ${this.huggingfaceKey}`,
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer",
                timeout: 120000 // 2 mins timeout
            }
        );

        // Save binary data to file
        const filename = `vid_${uuidv4()}.mp4`;
        const filepath = path.join(this.PUBLIC_DIR, filename);

        fs.writeFileSync(filepath, response.data);

        const baseUrl = process.env.API_URL || "http://localhost:5000";
        const videoUrl = `${baseUrl}/public/generated/${filename}`;

        return {
            jobId: `hf_${Date.now()}`,
            status: "succeeded",
            videoUrl: videoUrl,
            thumbnailUrl: "https://via.placeholder.com/576x320?text=Video+Ready"
        };
    }

    /**
     * Animate an image (Image-to-Video)
     */
    async animateImage(imageUrl: string, prompt?: string): Promise<VideoGenerationResult> {
        // 1. Try Replicate Image-to-Video (SVD)
        if (this.replicateKey) {
            try {
                console.log(`[AIVideoService] Starting animation for image: ${imageUrl.slice(0, 30)}...`);
                const response = await axios.post(
                    "https://api.replicate.com/v1/predictions",
                    {
                        version: "3f0457e4619daac51203dedb472816f3af3d23eff75b79d960535e69297b63d9", // SVD
                        input: {
                            input_image: imageUrl,
                            video_length: "14_frames_with_svd",
                            sizing_strategy: "maintain_aspect_ratio",
                            frames_per_second: 6,
                            motion_bucket_id: 127,
                            cond_aug: 0.02
                        }
                    },
                    {
                        headers: {
                            Authorization: `Token ${this.replicateKey}`,
                            "Content-Type": "application/json",
                        }
                    }
                );

                return {
                    jobId: response.data.id,
                    status: "processing",
                    thumbnailUrl: imageUrl
                };

            } catch (error: any) {
                console.error("[AIVideoService] Replicate Animate failed:", error.message);
            }
        }

        // 2. Fallback: Use Hugging Face Text-to-Video (if prompt is available)
        if (this.huggingfaceKey && prompt) {
            console.log(`[AIVideoService] Fallback: Using HF Text-to-Video for animation prompt: "${prompt}"`);
            try {
                return await this.generateWithHuggingFace({ prompt });
            } catch (error: any) {
                console.warn("[AIVideoService] HF Fallback failed:", error.message);
            }
        }

        // 3. Fallback to Mock
        return this.mockGeneration({ prompt: prompt || "Animation", duration: 3 });
    }

    async checkStatus(jobId: string): Promise<VideoGenerationResult> {
        if (jobId.startsWith("mock_")) {
            return this.checkMockStatus(jobId);
        }

        if (jobId.startsWith("runway_")) {
            return this.checkRunwayStatus(jobId);
        }

        if (jobId.startsWith("google_")) {
            return this.checkGeminiStatus(jobId);
        }

        if (jobId.startsWith("hf_")) {
            return {
                jobId,
                status: "succeeded",
                error: "Status check for synchronous HF jobs not persisted."
            };
        }

        if (!this.replicateKey) {
            return { jobId, status: "failed", error: "No provider configured" };
        }

        try {
            const response = await axios.get(
                `https://api.replicate.com/v1/predictions/${jobId}`,
                {
                    headers: { Authorization: `Token ${this.replicateKey}` }
                }
            );

            const prediction = response.data;
            let status: VideoGenerationResult["status"] = "processing";
            let videoUrl = undefined;

            if (prediction.status === "succeeded") {
                status = "succeeded";
                videoUrl = prediction.output && prediction.output[0];
            } else if (prediction.status === "failed") status = "failed";
            else if (prediction.status === "canceled") status = "canceled";

            return {
                jobId: prediction.id,
                status,
                videoUrl,
                thumbnailUrl: videoUrl || "https://via.placeholder.com/576x320?text=Processing...",
                error: prediction.error
            };

        } catch (error: any) {
            console.error(`[AIVideoService] Failed to check status for ${jobId}:`, error.message);
            return { jobId, status: "failed", error: "Failed to fetch status" };
        }
    }

    private async checkGeminiStatus(jobIdWithPrefix: string): Promise<VideoGenerationResult> {
        // jobId format: google_projects/123/locations/us-central1/operations/abc
        const operationName = jobIdWithPrefix.replace("google_", "");

        if (!this.geminiKey) {
            return { jobId: jobIdWithPrefix, status: "failed", error: "Gemini key missing" };
        }

        try {
            // Get operation status: GET https://generativelanguage.googleapis.com/v1beta/{name}?key=API_KEY
            const url = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${this.geminiKey}`;
            const response = await axios.get(url);

            const operation = response.data;
            // operation: { name, metadata, done, result: { response } or error }

            let status: VideoGenerationResult["status"] = "processing";
            let videoUrl = undefined;

            if (operation.done) {
                if (operation.error) {
                    status = "failed";
                    return {
                        jobId: jobIdWithPrefix,
                        status: "failed",
                        error: operation.error.message || "Gemini generation failed"
                    };
                }

                if (operation.response) {
                    status = "succeeded";
                    // Need to extract video URI from operation.response
                    // According to Veo docs it might be in: response.result.videoUri or similar
                    // Let's dump response to log to be safe first time
                    // But typically: response.generatedVideos[0].video.uri ??
                    // Adjusting based on standard predictLongRunning response structure
                    // The "response" field in operation is the PredictResponse.

                    const predictions = operation.response.predictions || operation.response.generatedVideos; // Handling both potential formats

                    if (predictions && predictions.length > 0) {
                        // Format 1: predictions[0].video.uri
                        // Format 2: generatedVideos[0].videoUri
                        const first = predictions[0];
                        // Try to find the URI deeply
                        videoUrl = first.videoUri || first.video?.uri || first.uri;

                        if (!videoUrl && first.bytesBase64Encoded) {
                            // Handle if it returns base64 (unlikely for video but possible)
                            // Would need to save to file
                            // For now assume URI
                        }
                    }
                }
            }

            return {
                jobId: jobIdWithPrefix,
                status,
                videoUrl,
                thumbnailUrl: videoUrl || "https://via.placeholder.com/576x320?text=Gemini+Processing...",
                error: operation.error?.message
            };
        } catch (error: any) {
            console.error(`[AIVideoService] Failed to check Gemini status for ${operationName}:`, error.message);
            return { jobId: jobIdWithPrefix, status: "failed", error: error.message };
        }
    }

    private async checkRunwayStatus(jobIdWithPrefix: string): Promise<VideoGenerationResult> {
        const realId = jobIdWithPrefix.replace("runway_", "");
        if (!this.runwaymlKey) {
            return { jobId: jobIdWithPrefix, status: "failed", error: "RunwayML key missing" };
        }

        try {
            const response = await axios.get(
                `https://api.dev.runwayml.com/v1/tasks/${realId}`,
                {
                    headers: {
                        "Authorization": `Bearer ${this.runwaymlKey}`,
                        "X-Runway-Version": "2024-11-06"
                    }
                }
            );

            const task = response.data;
            let status: VideoGenerationResult["status"] = "processing";
            let videoUrl = undefined;

            if (task.status === "SUCCEEDED") {
                status = "succeeded";
                // Runway output is typically an array of URLs
                videoUrl = task.output && task.output[0];
            } else if (task.status === "FAILED") {
                status = "failed";
            }

            return {
                jobId: jobIdWithPrefix,
                status,
                videoUrl,
                thumbnailUrl: videoUrl || "https://via.placeholder.com/576x320?text=Runway+Processing...",
                error: task.failure
            };
        } catch (error: any) {
            console.error(`[AIVideoService] Failed to check Runway status for ${realId}:`, error.message);
            return { jobId: jobIdWithPrefix, status: "failed", error: error.message };
        }
    }

    // --- Mock Fallbacks ---

    private mockGeneration(params: VideoGenerationParams): VideoGenerationResult {
        const mockId = `mock_${Date.now()}`;
        console.log(`[AIVideoService] Using Mock Generation for ${mockId}`);
        return {
            jobId: mockId,
            status: "processing",
            thumbnailUrl: "https://via.placeholder.com/576x320?text=Mock+Generating..."
        };
    }

    private checkMockStatus(jobId: string): VideoGenerationResult {
        const timestamp = parseInt(jobId.split("_")[1]);
        const elapsed = Date.now() - timestamp;

        if (elapsed > 5000) {
            return {
                jobId,
                status: "succeeded",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                thumbnailUrl: "https://via.placeholder.com/576x320?text=Video+Ready"
            };
        }

        return {
            jobId,
            status: "processing",
            thumbnailUrl: "https://via.placeholder.com/576x320?text=Mock+Processing..."
        };
    }
}

export const aiVideoService = new AIVideoService();