import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";

/**
 * AI Image Generation Service
 * Supports multiple providers with automatic fallback
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
}

export type AIProvider = "gemini" | "pollinations" | "huggingface" | "segmind" | "replicate";

class AIImageService {
    private providers: AIProvider[];
    private geminiKey?: string;
    private huggingfaceKey?: string;
    private segmindKey?: string;
    private replicateKey?: string;
    private PUBLIC_DIR: string;
    private BASE_URL: string;

    constructor() {
        // Load API keys from environment
        this.geminiKey = process.env.GEMINI_API_KEY;
        this.huggingfaceKey = process.env.HUGGINGFACE_API_KEY;
        this.segmindKey = process.env.SEGMIND_API_KEY;
        this.replicateKey = process.env.REPLICATE_API_KEY;
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

        // Set provider priority from env or use default with fallback
        const priorityString = process.env.AI_PROVIDER_PRIORITY || "gemini,pollinations";
        this.providers = priorityString.split(",").map(p => p.trim()) as AIProvider[];

        // ALWAYS ensure pollinations is included as a fallback since it's free and reliable
        if (!this.providers.includes("pollinations")) {
            this.providers.push("pollinations");
            console.log("[AI Service] Added pollinations as fallback provider (free, no API key required)");
        }

        // Debug: List models on startup to help the user identify their access
        if (this.geminiKey) {
            console.log("[AI Service] Gemini key found, listing available models...");
            this.listAvailableGeminiModels().catch(() => { });
        }
    }

    /**
     * Generate image using the first available provider
     */
    async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
        const errors: Record<string, string> = {};

        // Try each provider in order
        for (const provider of this.providers) {
            try {
                // Skip providers if their key is missing (except pollinations which needs none)
                if (provider === "gemini" && !this.geminiKey) continue;
                if (provider === "huggingface" && !this.huggingfaceKey) continue;
                if (provider === "segmind" && !this.segmindKey) continue;
                if (provider === "replicate" && !this.replicateKey) continue;

                console.log(`[AI Service] Trying provider: ${provider}`);
                const result = await this.generateWithProvider(provider, params);
                console.log(`[AI Service] Success with provider: ${provider}`);
                return result;
            } catch (error: any) {
                const errorMsg = error.message || "Unknown error";
                console.error(`[AI Service] ${provider} failed:`, errorMsg);
                errors[provider] = errorMsg;
            }
        }

        // All providers failed
        throw new Error(
            `All AI providers failed. Errors: ${JSON.stringify(errors, null, 2)}`
        );
    }

    /**
     * Generate image with a specific provider
     */
    private async generateWithProvider(
        provider: AIProvider,
        params: ImageGenerationParams
    ): Promise<ImageGenerationResult> {
        switch (provider) {
            case "gemini":
                return this.generateWithGemini(params);
            case "pollinations":
                return this.generateWithPollinations(params);
            case "huggingface":
                return this.generateWithHuggingFace(params);
            case "segmind":
                return this.generateWithSegmind(params);
            case "replicate":
                return this.generateWithReplicate(params);
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }

    /**
     * Google Gemini - Image generation using Imagen
     */
    private async generateWithGemini(
        params: ImageGenerationParams
    ): Promise<ImageGenerationResult> {
        if (!this.geminiKey) {
            throw new Error("Gemini API key not configured");
        }

        const { prompt, width = 1024, height = 1024, seed } = params;

        try {
            // Try Imagen 4.0 models first (newer), then fall back to older versions
            // These models are based on what's available in the user's Google AI account
            const modelVersions = [
                "imagen-4.0-generate-001",           // Primary Imagen 4.0
                "imagen-4.0-fast-generate-001",      // Fast Imagen 4.0
                "imagen-4.0-generate-preview-06-06", // Preview version
                "imagen-4.0-ultra-generate-001",
                "imagen-3.0-generate-001",
                "imagen-3.0-generate-002",
                "imagen-3.0-fast-generate-001",
                "imagen-3.0-capability-generate-001",
                "imagen-2.0-generate-001", // Even older version just in case
                "gemini-2.5-flash-image",
                "gemini-2.0-flash-exp-image-generation",
            ];
            let lastError: any;

            // Optional: List available models to console for debugging if we hit issues
            if (process.env.DEBUG_AI) {
                this.listAvailableGeminiModels().catch(console.error);
            }

            for (const model of modelVersions) {
                try {
                    console.log(`[Gemini] Attempting with model: ${model}`);
                    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`;

                    const requestBody: any = {
                        instances: [
                            {
                                prompt: prompt,
                            }
                        ],
                        parameters: {
                            sampleCount: 1,
                            aspectRatio: this.getAspectRatio(width, height),
                            safetyFilterLevel: "block_some",
                            personGeneration: "allow_adult",
                        }
                    };

                    const response = await axios.post(
                        apiUrl,
                        requestBody,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "x-goog-api-key": this.geminiKey,
                            },
                            timeout: 60000,
                        }
                    );

                    // Extract the image from the response
                    let imageData: string | undefined;

                    if (response.data.predictions && Array.isArray(response.data.predictions)) {
                        const prediction = response.data.predictions[0];
                        imageData =
                            prediction?.bytesBase64Encoded ||
                            prediction?.image?.bytesBase64Encoded ||
                            prediction?.imageBytes ||
                            prediction?.image?.imageBytes;
                    } else if (response.data.generatedImages && Array.isArray(response.data.generatedImages)) {
                        const generatedImage = response.data.generatedImages[0];
                        imageData =
                            generatedImage?.bytesBase64Encoded ||
                            generatedImage?.image?.bytesBase64Encoded ||
                            generatedImage?.imageBytes;
                    }

                    if (!imageData) {
                        console.error(`[Gemini] No image data in response for ${model}`);
                        continue;
                    }

                    // Save Base64 to file instead of returning data URI
                    const filename = `img_${uuidv4()}.png`;
                    const filepath = path.join(this.PUBLIC_DIR, filename);

                    fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));

                    const imageUrl = `/public/generated/${filename}`; // Relative URL for frontend
                    console.log(`[Gemini] Success with ${model}, saved to ${filepath}`);

                    return {
                        url: `${this.BASE_URL}${imageUrl}`, // Absolute URL
                        provider: "gemini",
                        seed,
                        width,
                        height,
                    };
                } catch (err: any) {
                    lastError = err;
                    if (err.response?.status === 404) {
                        console.warn(`[Gemini] Model ${model} returned 404. Skipping...`);
                        continue;
                    }
                    console.error(`[Gemini] Error with ${model}:`, err.response?.data || err.message);

                    // Fail fast for billing/quota issues
                    if (err.response?.status === 429 || err.response?.status === 403) {
                        break;
                    }
                }
            }

            // All models failed with 404 or other errors
            if (lastError?.response?.status === 404) {
                throw new Error("Gemini Imagen models not available. Falling back to Pollinations. Check Google AI Studio (aistudio.google.com) for model access.");
            }
            throw lastError || new Error("All Gemini models failed");
        } catch (error: any) {
            if (error.response?.status === 400) {
                console.error("[Gemini] Bad request error:", JSON.stringify(error.response.data, null, 2));
                throw new Error(`Gemini API bad request: ${error.response.data?.error?.message || "Unknown error"}`);
            }

            throw new Error(`Gemini failed: ${error.message}`);
        }
    }

    /**
     * Helper to determine aspect ratio from width and height
     */
    private getAspectRatio(width: number, height: number): string {
        const ratio = width / height;

        if (Math.abs(ratio - 1) < 0.1) return "1:1";
        if (Math.abs(ratio - 16 / 9) < 0.1) return "16:9";
        if (Math.abs(ratio - 9 / 16) < 0.1) return "9:16";
        if (Math.abs(ratio - 4 / 3) < 0.1) return "4:3";
        if (Math.abs(ratio - 3 / 4) < 0.1) return "3:4";

        // Default to closest standard ratio
        return ratio > 1 ? "16:9" : "9:16";
    }

    /**
     * Pollinations.AI - Free, no API key required
     * Returns URL directly - image is generated on-demand when client fetches URL
     */
    private async generateWithPollinations(
        params: ImageGenerationParams
    ): Promise<ImageGenerationResult> {
        const { prompt, width = 1024, height = 1024, seed } = params;

        // Build URL with parameters
        const baseUrl = "https://image.pollinations.ai/prompt";

        // Clean and potentially shorten prompt for Pollinations reliability
        let cleanPrompt = prompt
            .replace(/\.\.+/g, '.') // remove double dots
            .replace(/[\\/:*?"<>|]/g, ' ') // remove invalid path characters
            .replace(/\s+/g, ' ')
            .trim();

        // Truncate if extremely long (Pollinations limit)
        if (cleanPrompt.length > 500) {
            cleanPrompt = cleanPrompt.substring(0, 500);
        }

        let url = `${baseUrl}/${encodeURIComponent(cleanPrompt)}`;

        // Add optional parameters
        const queryParams: string[] = [];
        if (width) queryParams.push(`width=${width}`);
        if (height) queryParams.push(`height=${height}`);
        if (seed) queryParams.push(`seed=${seed}`);
        queryParams.push("nologo=true");
        queryParams.push("enhance=false"); // Disable enhance if potentially causing issues with custom ratios

        if (queryParams.length > 0) {
            url += `?${queryParams.join("&")}`;
        }

        // Pollinations generates the image on-demand when the URL is accessed
        // No need to validate - just return the URL directly
        // The image will be generated when the frontend fetches it
        console.log(`[Pollinations] Generated URL: ${url}`);

        return {
            url,
            provider: "pollinations",
            seed,
            width,
            height,
        };
    }

    /**
     * Hugging Face Inference API
     */
    private async generateWithHuggingFace(
        params: ImageGenerationParams
    ): Promise<ImageGenerationResult> {
        if (!this.huggingfaceKey) {
            throw new Error("Hugging Face API key not configured");
        }

        const { prompt, width = 1024, height = 1024, seed, negativePrompt } = params;

        // Use Stable Diffusion 2.1 model
        const model = "stabilityai/stable-diffusion-2-1";
        const apiUrl = `https://api-inference.huggingface.co/models/${model}`;

        try {
            const response = await axios.post(
                apiUrl,
                {
                    inputs: prompt,
                    parameters: {
                        negative_prompt: negativePrompt || "",
                        width,
                        height,
                        num_inference_steps: 30,
                        guidance_scale: 7.5,
                        seed: seed || Math.floor(Math.random() * 100000),
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.huggingfaceKey}`,
                        "Content-Type": "application/json",
                    },
                    responseType: "arraybuffer",
                    timeout: 60000, // 60 seconds
                }
            );

            // Convert image buffer to base64
            const base64Image = Buffer.from(response.data, "binary").toString("base64");
            const imageUrl = `data:image/png;base64,${base64Image}`;

            return {
                url: imageUrl,
                provider: "huggingface",
                seed,
                width,
                height,
            };
        } catch (error: any) {
            if (error.response?.status === 503) {
                throw new Error("Model is loading, please try again in a few seconds");
            }
            throw new Error(`Hugging Face failed: ${error.message}`);
        }
    }

    /**
     * Segmind API
     */
    private async generateWithSegmind(
        params: ImageGenerationParams
    ): Promise<ImageGenerationResult> {
        if (!this.segmindKey) {
            throw new Error("Segmind API key not configured");
        }

        const { prompt, width = 1024, height = 1024, seed, negativePrompt } = params;

        try {
            const response = await axios.post(
                "https://api.segmind.com/v1/sd2.1-txt2img",
                {
                    prompt,
                    negative_prompt: negativePrompt || "ugly, blurry, low quality",
                    samples: 1,
                    scheduler: "UniPC",
                    num_inference_steps: 25,
                    guidance_scale: 7.5,
                    seed: seed || Math.floor(Math.random() * 100000),
                    img_width: width,
                    img_height: height,
                    base64: false,
                },
                {
                    headers: {
                        "x-api-key": this.segmindKey,
                        "Content-Type": "application/json",
                    },
                    timeout: 60000,
                }
            );

            return {
                url: response.data.image || response.data.url,
                provider: "segmind",
                seed,
                width,
                height,
            };
        } catch (error: any) {
            throw new Error(`Segmind failed: ${error.message}`);
        }
    }

    /**
     * Replicate API
     */
    private async generateWithReplicate(
        params: ImageGenerationParams
    ): Promise<ImageGenerationResult> {
        if (!this.replicateKey) {
            throw new Error("Replicate API key not configured");
        }

        const { prompt, width = 1024, height = 1024, seed, negativePrompt } = params;

        try {
            // Start prediction
            const startResponse = await axios.post(
                "https://api.replicate.com/v1/predictions",
                {
                    version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // SDXL
                    input: {
                        prompt,
                        negative_prompt: negativePrompt || "",
                        width,
                        height,
                        num_inference_steps: 25,
                        guidance_scale: 7.5,
                        seed: seed || Math.floor(Math.random() * 100000),
                    },
                },
                {
                    headers: {
                        Authorization: `Token ${this.replicateKey}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const predictionId = startResponse.data.id;

            // Poll for completion
            let attempts = 0;
            const maxAttempts = 60; // 60 seconds max

            while (attempts < maxAttempts) {
                const statusResponse = await axios.get(
                    `https://api.replicate.com/v1/predictions/${predictionId}`,
                    {
                        headers: {
                            Authorization: `Token ${this.replicateKey}`,
                        },
                    }
                );

                const status = statusResponse.data.status;

                if (status === "succeeded") {
                    return {
                        url: statusResponse.data.output[0],
                        provider: "replicate",
                        seed,
                        width,
                        height,
                    };
                }

                if (status === "failed") {
                    throw new Error("Replicate prediction failed");
                }

                // Wait 1 second before polling again
                await new Promise((resolve) => setTimeout(resolve, 1000));
                attempts++;
            }

            throw new Error("Replicate timeout");
        } catch (error: any) {
            throw new Error(`Replicate failed: ${error.message}`);
        }
    }

    /**
     * Get available providers
     */
    getAvailableProviders(): AIProvider[] {
        return this.providers.filter((provider) => {
            switch (provider) {
                case "gemini":
                    return !!this.geminiKey;
                case "pollinations":
                    return true; // Always available
                case "huggingface":
                    return !!this.huggingfaceKey;
                case "segmind":
                    return !!this.segmindKey;
                case "replicate":
                    return !!this.replicateKey;
                default:
                    return false;
            }
        });
    }
    private availableModels: string[] = [];

    /**
     * Debug helper to list all available models for this API key
     */
    private async listAvailableGeminiModels(): Promise<string[]> {
        if (!this.geminiKey) return [];
        try {
            const response = await axios.get(
                "https://generativelanguage.googleapis.com/v1beta/models",
                {
                    params: { key: this.geminiKey },
                    timeout: 10000,
                }
            );
            const models = response.data.models?.map((m: any) => m.name.replace('models/', '')) || [];
            console.log("[Gemini] Available Models:", models.join(", "));
            this.availableModels = models;
            return models;
        } catch (error: any) {
            console.error("[Gemini] Failed to list models:", error.message);
            return [];
        }
    }

    /**
     * Google Gemini - Text generation
     */
    async generateText(prompt: string): Promise<string> {
        if (!this.geminiKey) {
            throw new Error("Gemini API key not configured");
        }

        // Refresh available models if empty
        if (this.availableModels.length === 0) {
            await this.listAvailableGeminiModels();
        }

        // Prioritize models that are confirmed available, otherwise use defaults
        const defaultModels = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-1.0-pro"
        ];

        let candidateModels = [...defaultModels];

        if (this.availableModels.length > 0) {
            // If we know what's available, prioritize those
            const availableDefaults = defaultModels.filter(m => this.availableModels.includes(m));
            const otherGemini = this.availableModels.filter(m =>
                m.includes('gemini') &&
                !defaultModels.includes(m) &&
                !m.includes('vision') // Exclude vision-only if any
            );
            // Put confirmed available defaults first, then other gemini models, then the raw defaults (as fallback)
            candidateModels = [...new Set([...availableDefaults, ...otherGemini, ...defaultModels])];
        }

        let lastError: any;

        for (const model of candidateModels) {
            try {
                console.log(`[Gemini Text] Attempting with model: ${model}`);
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

                const response = await axios.post(
                    apiUrl,
                    {
                        contents: [{ parts: [{ text: prompt }] }]
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-goog-api-key": this.geminiKey,
                        },
                        timeout: 30000,
                    }
                );

                const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) continue;

                return text;
            } catch (error: any) {
                console.warn(`[Gemini Text] Failed with ${model}:`, error.message);
                lastError = error;
                if (error.response?.status === 404) continue;
                if (error.response?.status === 429 || error.response?.status === 403) continue;
            }
        }

        const errorInfo = {
            message: lastError?.message || "All models failed",
            availableModels: this.availableModels,
            triedModels: candidateModels
        };

        console.error("[Gemini Text] All models failed.", JSON.stringify(errorInfo, null, 2));
        throw new Error(`Gemini Text Generation failed: ${JSON.stringify(errorInfo)}`);
    }
}

// Export singleton instance
export const aiImageService = new AIImageService();
