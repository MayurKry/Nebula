import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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
    private readonly ZEROSCOPE_VERSION = "02fa9c6c4493eb21c7205126fe837e5c52c676c8c10508a8f4c4784a0d810ba7"; // Zeroscope XL
    private PUBLIC_DIR: string; // Not readonly anymore to allow dynamic assignment

    constructor() {
        this.replicateKey = process.env.REPLICATE_API_KEY;
        this.huggingfaceKey = process.env.HUGGINGFACE_API_KEY;

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
     * Tries Replicate -> HuggingFace -> Mock
     */
    async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult> {
        // 1. Try Replicate (High Quality, Paid)
        if (this.replicateKey) {
            try {
                return await this.generateWithReplicate(params);
            } catch (error: any) {
                console.warn("[AIVideoService] Replicate failed, trying fallback:", error.message);
            }
        }

        // 2. Try Hugging Face (Medium Quality, Free/Rate-limited)
        if (this.huggingfaceKey) {
            try {
                return await this.generateWithHuggingFace(params);
            } catch (error: any) {
                console.warn("[AIVideoService] Hugging Face failed, using mock:", error.message);
            }
        }

        // 3. Fallback to Mock (Dev/Demo)
        console.warn("[AIVideoService] No working providers found. Using mock generation.");
        return this.mockGeneration(params);
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

    /**
     * Check the status of a specific job
     */
    async checkStatus(jobId: string): Promise<VideoGenerationResult> {
        if (jobId.startsWith("mock_")) {
            return this.checkMockStatus(jobId);
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
                videoUrl: "https://joy1.videvo.net/videvo_files/video/free/2019-11/large_watermarked/190301_1_25_11_preview.mp4",
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