import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { costTracker } from "../utils/costTracker";
import { runwayService } from "./runway.service";
import { promptEnhancer } from "./prompt-enhancer.service";
import logger from "../utils/logger";

/**
 * STRICTLY USES RUNWAY ML ONLY - NO FALLBACK PROVIDERS
 * Model: gen3a_turbo (Standard Production Model)
 */

export interface VideoGenerationParams {
    prompt: string;
    model?: string;
    style?: string;
    duration?: number;
    width?: number;
    height?: number;
}

export interface VideoGenerationResult {
    jobId: string;
    status: "processing" | "succeeded" | "failed" | "canceled";
    videoUrl?: string;
    thumbnailUrl?: string;
    error?: string;
    originalPrompt?: string;
    enhancedPrompt?: string;
    creditsUsed?: number;
    estimatedCost?: number;
}

class AIVideoService {
    private PUBLIC_DIR: string;

    constructor() {
        // Determine output directory based on environment
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
            logger.warn(`[AIVideoService] Failed to create output directory at ${this.PUBLIC_DIR}. Falling back to system temp dir.`);
            this.PUBLIC_DIR = path.join(require('os').tmpdir(), "generated");
            try {
                if (!fs.existsSync(this.PUBLIC_DIR)) {
                    fs.mkdirSync(this.PUBLIC_DIR, { recursive: true });
                }
            } catch (e) {
                logger.error("[AIVideoService] Critical: Could not create any temp directory.", e);
            }
        }

        logger.info("[AI Video Service] 🔒 STRICTLY USING RUNWAY ML ONLY");
        logger.info("[AI Video Service] Model: gen3a_turbo (Standard Production Model)");
        logger.info("[AI Video Service] ✅ Prompt enhancement enabled");
    }

    /**
     * Generate video using STRICTLY RUNWAY ML ONLY
     * Model: gen3a_turbo (Standard Production Model)
     * NO FALLBACK PROVIDERS
     */
    async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult> {
        // Clean prompt: remove newlines and extra spaces
        const originalPrompt = (params.prompt || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
        const model = params.model || "gen3a_turbo";
        const duration = params.duration || 5; // Default 5 seconds

        logger.info(`[AI Video Service] 🔒 Using ${model}`);
        logger.info(`[AI Video Service] Original prompt: "${originalPrompt}"`);
        logger.info(`[AI Video Service] Duration: ${duration}s`);

        // Calculate ratio if width/height provided
        let ratio = "1280:720";
        if (params.width && params.height) {
            ratio = `${params.width}:${params.height}`;
        }

        try {
            // Step 1: Enhance the prompt
            const enhancedPrompt = promptEnhancer.enhanceVideoPrompt(originalPrompt);
            logger.info(`[AI Video Service] Enhanced prompt: "${enhancedPrompt}"`);

            // Step 2: Get cost estimate
            const costEstimate = runwayService.estimateVideoCost(duration);
            logger.info(`[AI Video Service] Estimated cost: ${costEstimate.credits} credits ($${costEstimate.cost.toFixed(2)})`);

            // Step 3: Generate with Runway ML
            const result = await runwayService.textToVideo({
                prompt: enhancedPrompt,
                model: model,
                duration: duration,
                ratio: ratio
            });

            logger.info(`[AI Video Service] ✅ Video generation started, job ID: ${result.id}`);

            return {
                jobId: `runway_${result.id}`,
                status: "processing",
                thumbnailUrl: "https://via.placeholder.com/1280x720?text=Runway+Gen4+Turbo+Processing...",
                originalPrompt,
                enhancedPrompt,
                creditsUsed: costEstimate.credits,
                estimatedCost: costEstimate.cost
            };

        } catch (error: any) {
            logger.error(`[AI Video Service] ❌ Runway ML generation failed:`, error.message);

            // Re-throw with clear message - NO FALLBACK
            if (error.message.includes("credits exhausted") || error.message.includes("rate limit")) {
                throw new Error(`Runway ML credits exhausted or rate limit reached. Please try again later or add more credits. Original error: ${error.message}`);
            }

            if (error.message.includes("Invalid API key")) {
                throw new Error(`Runway ML API key is invalid. Please check your RUNWAYML_API_KEY environment variable.`);
            }

            throw new Error(`Runway ML video generation failed: ${error.message}. No fallback providers available.`);
        }
    }

    /**
     * Check video generation status
     */
    async checkStatus(jobId: string): Promise<VideoGenerationResult> {
        if (jobId.startsWith("runway_")) {
            return this.checkRunwayStatus(jobId);
        }

        throw new Error(`Unknown job ID format: ${jobId}. Only Runway ML jobs are supported.`);
    }

    /**
     * Check Runway ML video status
     */
    private async checkRunwayStatus(jobIdWithPrefix: string): Promise<VideoGenerationResult> {
        const realId = jobIdWithPrefix.replace("runway_", "");

        try {
            const status = await runwayService.checkStatus(realId);

            let videoStatus: VideoGenerationResult["status"] = "processing";
            let videoUrl = undefined;

            if (status.status === "SUCCEEDED") {
                videoStatus = "succeeded";
                videoUrl = status.output && status.output[0];
            } else if (status.status === "FAILED") {
                videoStatus = "failed";
            } else if (status.status === "CANCELLED") {
                videoStatus = "canceled";
            }

            return {
                jobId: jobIdWithPrefix,
                status: videoStatus,
                videoUrl,
                thumbnailUrl: videoUrl || "https://via.placeholder.com/1280x720?text=Runway+Processing...",
                error: status.failure
            };
        } catch (error: any) {
            logger.error(`[AIVideoService] Failed to check Runway status for ${realId}:`, error.message);
            return {
                jobId: jobIdWithPrefix,
                status: "failed",
                error: error.message
            };
        }
    }

    /**
     * Animate an image (Image-to-Video) - NOT SUPPORTED
     * This method exists for backward compatibility but is not supported
     */
    async animateImage(imageUrl: string, prompt?: string): Promise<VideoGenerationResult> {
        throw new Error("Image-to-video animation is not currently supported with Runway ML gen4_turbo. Please use text-to-video instead.");
    }
}

export const aiVideoService = new AIVideoService();