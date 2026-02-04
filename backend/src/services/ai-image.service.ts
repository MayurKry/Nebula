import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import { costTracker } from "../utils/costTracker";
import { runwayService } from "./runway.service";
import { promptEnhancer } from "./prompt-enhancer.service";
import logger from "../utils/logger";

/**
 * AI Image Generation Service
 * STRICTLY USES RUNWAY ML ONLY - NO FALLBACK PROVIDERS
 * Model: gen4_image_turbo (2 credits = $0.02 per image)
 */

export interface ImageGenerationParams {
    prompt: string;
    style?: string;
    width?: number;
    height?: number;
    seed?: number;
    negativePrompt?: string;
}

export interface ImageGenerationResult {
    url: string;
    provider: string;
    seed?: number;
    width: number;
    height: number;
    originalPrompt?: string;
    enhancedPrompt?: string;
    creditsUsed?: number;
    estimatedCost?: number;
}

class AIImageService {
    private PUBLIC_DIR: string;
    private BASE_URL: string;

    constructor() {
        this.BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:5000";

        // Determine output directory
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
            console.warn(`[AI Service] Failed to create output directory at ${this.PUBLIC_DIR}. Falling back to system temp.`);
            this.PUBLIC_DIR = path.join(os.tmpdir(), "generated");
            if (!fs.existsSync(this.PUBLIC_DIR)) {
                fs.mkdirSync(this.PUBLIC_DIR, { recursive: true });
            }
        }

        logger.info("[AI Image Service] 🔒 STRICTLY USING RUNWAY ML ONLY");
        logger.info("[AI Image Service] Model: gen4_image (5 credits = $0.05 per image)");
        logger.info("[AI Image Service] ✅ Prompt enhancement enabled");
    }

    /**
     * Generate image using STRICTLY RUNWAY ML ONLY
     * Model: gen4_image (5 credits = $0.05)
     * NO FALLBACK PROVIDERS
     */
    async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
        const originalPrompt = params.prompt;

        logger.info(`[AI Image Service] 🔒 Using RUNWAY ML ONLY (gen4_image)`);
        logger.info(`[AI Image Service] Original prompt: "${originalPrompt}"`);

        try {
            // Step 1: Enhance the prompt
            const enhancedPrompt = promptEnhancer.enhanceImagePrompt(originalPrompt);
            logger.info(`[AI Image Service] Enhanced prompt: "${enhancedPrompt}"`);

            // Step 2: Get cost estimate
            const costEstimate = runwayService.estimateImageCost();
            logger.info(`[AI Image Service] Estimated cost: ${costEstimate.credits} credits ($${costEstimate.cost.toFixed(2)})`);

            // Step 3: Generate with Runway ML
            const result = await runwayService.textToImage({
                prompt: enhancedPrompt,
                width: params.width,
                height: params.height,
            });

            // Step 4: Poll for completion
            let attempts = 0;
            const maxAttempts = 30; // 60 seconds max

            while (attempts < maxAttempts) {
                const status = await runwayService.checkStatus(result.id);

                if (status.status === "SUCCEEDED" && status.output?.[0]) {
                    logger.info(`[AI Image Service] ✅ Image generation successful`);

                    return {
                        url: status.output[0],
                        provider: "runway",
                        width: params.width || 1024,
                        height: params.height || 1024,
                        originalPrompt,
                        enhancedPrompt,
                        creditsUsed: costEstimate.credits,
                        estimatedCost: costEstimate.cost
                    };
                }

                if (status.status === "FAILED") {
                    throw new Error(`Runway generation failed: ${status.failure || "Unknown error"}`);
                }

                // Wait 2 seconds before polling again
                await new Promise(r => setTimeout(r, 2000));
                attempts++;
            }

            throw new Error("Runway generation timed out after 60 seconds");

        } catch (error: any) {
            logger.error(`[AI Image Service] ❌ Runway ML generation failed:`, error.message);

            // Re-throw with clear message - NO FALLBACK
            if (error.message.includes("credits exhausted") || error.message.includes("rate limit")) {
                throw new Error(`Runway ML credits exhausted or rate limit reached. Please try again later or add more credits. Original error: ${error.message}`);
            }

            if (error.message.includes("Invalid API key")) {
                throw new Error(`Runway ML API key is invalid. Please check your RUNWAYML_API_KEY environment variable.`);
            }

            throw new Error(`Runway ML image generation failed: ${error.message}. No fallback providers available.`);
        }
    }

    /**
     * Get available providers (only Runway ML)
     */
    getAvailableProviders(): string[] {
        return ["runway"];
    }

    /**
     * Generate text using Gemini API
     */
    async generateText(prompt: string): Promise<string> {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "api_key_missing") {
            throw new Error("Gemini API key is missing. Text generation unavailable.");
        }

        try {
            logger.info(`[AI Image Service] 🤖 Generating text with Gemini...`);
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    contents: [{ parts: [{ text: prompt }] }]
                },
                { headers: { "Content-Type": "application/json" } }
            );

            const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error("Invalid response from Gemini API");
            }

            return text;
        } catch (error: any) {
            logger.error(`[AI Image Service] Gemini text generation failed: ${error.message}`);
            throw new Error(`Gemini generation failed: ${error.message}`);
        }
    }
}

// Export singleton instance
export const aiImageService = new AIImageService();
