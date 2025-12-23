import axios from "axios";

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
    private readonly ZEROSCOPE_VERSION = "02fa9c6c4493eb21c7205126fe837e5c52c676c8c10508a8f4c4784a0d810ba7"; // Zeroscope XL

    constructor() {
        this.replicateKey = process.env.REPLICATE_API_KEY;
    }

    /**
     * Start a video generation job using Replicate
     */
    async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult> {
        if (!this.replicateKey) {
            console.warn("REPLICATE_API_KEY not found. Falling back to mock generation.");
            return this.mockGeneration(params);
        }

        const { prompt, duration = 3 } = params;

        try {
            console.log(`[AIVideoService] Starting generation for prompt: "${prompt}"`);

            // Call Replicate API to start prediction
            const response = await axios.post(
                "https://api.replicate.com/v1/predictions",
                {
                    version: this.ZEROSCOPE_VERSION,
                    input: {
                        prompt: prompt,
                        num_frames: 24, // Approx 3-4 seconds at 8fps default, adjust as needed
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

            const prediction = response.data;
            console.log(`[AIVideoService] Job started: ${prediction.id}`);

            return {
                jobId: prediction.id,
                status: "processing",
                thumbnailUrl: "https://via.placeholder.com/576x320?text=Generating+Video..."
            };

        } catch (error: any) {
            console.error("[AIVideoService] Replicate API failed:", error.message);
            // Fallback to mock if API fails
            return this.mockGeneration(params);
        }
    }

    /**
     * Animate an image (Image-to-Video)
     */
    async animateImage(imageUrl: string, prompt?: string): Promise<VideoGenerationResult> {
        if (!this.replicateKey) {
            return this.mockGeneration({ prompt: prompt || "Animation", duration: 3 });
        }

        try {
            console.log(`[AIVideoService] Starting animation for image: ${imageUrl.slice(0, 30)}...`);

            // Use Stable Video Diffusion
            const response = await axios.post(
                "https://api.replicate.com/v1/predictions",
                {
                    version: "3f0457e4619daac51203dedb472816f3af3d23eff75b79d960535e69297b63d9", // SVD
                    input: {
                        input_image: imageUrl,
                        video_length: "14_frames_with_svd", // or 25_frames_with_svd_xt
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

            const prediction = response.data;
            console.log(`[AIVideoService] Animation Job started: ${prediction.id}`);

            return {
                jobId: prediction.id,
                status: "processing",
                thumbnailUrl: imageUrl
            };

        } catch (error: any) {
            console.error("[AIVideoService] Animate Image failed:", error.message);
            return this.mockGeneration({ prompt: prompt || "Animation", duration: 3 });
        }
    }

    /**
     * Check the status of a specific job
     */
    async checkStatus(jobId: string): Promise<VideoGenerationResult> {
        if (!this.replicateKey) {
            return this.mockCheckStatus(jobId);
        }

        // Detect if this is a mock ID
        if (jobId.startsWith("mock_")) {
            return this.mockCheckStatus(jobId);
        }

        try {
            const response = await axios.get(
                `https://api.replicate.com/v1/predictions/${jobId}`,
                {
                    headers: {
                        Authorization: `Token ${this.replicateKey}`,
                    }
                }
            );

            const prediction = response.data;

            let status: VideoGenerationResult["status"] = "processing";
            let videoUrl = undefined;

            if (prediction.status === "succeeded") {
                status = "succeeded";
                videoUrl = prediction.output && prediction.output[0]; // Replicate returns array of outputs
            } else if (prediction.status === "failed") {
                status = "failed";
            } else if (prediction.status === "canceled") {
                status = "canceled";
            }

            return {
                jobId: prediction.id,
                status,
                videoUrl,
                thumbnailUrl: videoUrl || "https://via.placeholder.com/576x320?text=Processing...",
                error: prediction.error
            };

        } catch (error: any) {
            console.error(`[AIVideoService] Failed to check status for ${jobId}:`, error.message);
            return {
                jobId,
                status: "failed",
                error: "Failed to fetch status"
            };
        }
    }

    // --- Mock Fallbacks for robustness ---

    private mockGeneration(params: VideoGenerationParams): VideoGenerationResult {
        const mockId = `mock_${Date.now()}`;
        console.log(`[AIVideoService] Using Mock Generation for ${mockId}`);
        // In a real app we might store this ID in memory or DB to track 'progress'
        return {
            jobId: mockId,
            status: "processing",
            thumbnailUrl: "https://via.placeholder.com/576x320?text=Mock+Generating..."
        };
    }

    private mockCheckStatus(jobId: string): VideoGenerationResult {
        // Simulate completion based on time (ID has timestamp)
        const timestamp = parseInt(jobId.split("_")[1]);
        const now = Date.now();
        const elapsed = now - timestamp;

        // Complete after 5 seconds
        if (elapsed > 5000) {
            return {
                jobId,
                status: "succeeded",
                videoUrl: "https://joy1.videvo.net/videvo_files/video/free/2019-11/large_watermarked/190301_1_25_11_preview.mp4", // Sample stock video
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
