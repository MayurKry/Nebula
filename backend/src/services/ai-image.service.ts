import axios from "axios";

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

    constructor() {
        // Load API keys from environment
        this.geminiKey = process.env.GEMINI_API_KEY;
        this.huggingfaceKey = process.env.HUGGINGFACE_API_KEY;
        this.segmindKey = process.env.SEGMIND_API_KEY;
        this.replicateKey = process.env.REPLICATE_API_KEY;

        // Set provider priority from env or use default (ONLY GEMINI)
        const priorityString = process.env.AI_PROVIDER_PRIORITY || "gemini";
        this.providers = priorityString.split(",") as AIProvider[];
    }

    /**
     * Generate image using the first available provider
     */
    async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
        const errors: Record<string, string> = {};

        // Try each provider in order
        for (const provider of this.providers) {
            try {
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
            // Use Google's Imagen 4.0 API for image generation
            // Validated available models: imagen-4.0-generate-001
            const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict";

            // Construct valid request body for Imagen
            // Note: Seed is NOT supported in the current API version
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

            // Add negative prompt if provided (some models support it via parameters, others in instance)
            // For Imagen, it's often in parameters as negativePrompt or in instance
            // We'll trust the instance placement for now but check parameters if this fails
            // Actually, for consistency, let's keep it in instance as per docs
            /* 
               Warning: Some versions of Imagen on Vertex AI use 'negativePrompt' in parameters.
               The Generative Language API schema can vary. 
               We will stick to the previous 'instances' placement but be aware.
            */

            console.log(`[Gemini] Generating image with prompt: "${prompt.substring(0, 50)}..."`);
            console.log("[Gemini] Request Body:", JSON.stringify(requestBody, null, 2));

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
                console.error("[Gemini] Unexpected API response structure:");
                console.error(JSON.stringify(response.data, null, 2));
                throw new Error("No image data in Gemini response - check logs for details");
            }

            const imageUrl = `data:image/png;base64,${imageData}`;
            console.log(`[Gemini] Successfully generated image`);

            return {
                url: imageUrl,
                provider: "gemini",
                seed, // Return the seed we intended to use, even if API didn't use it
                width,
                height,
            };
        } catch (error: any) {
            if (error.response?.status === 429) {
                throw new Error("Gemini API rate limit exceeded");
            }
            if (error.response?.status === 403) {
                throw new Error("Gemini API key invalid or unauthorized");
            }
            if (error.response?.status === 404) {
                throw new Error("Gemini Imagen model not available - API key may not have access");
            }
            if (error.response?.status === 400) {
                console.error("[Gemini] Bad request error:", JSON.stringify(error.response.data, null, 2));
                throw new Error(`Gemini API bad request: ${error.response.data?.error?.message || "Unknown error"}`);
            }

            if (error.response?.data) {
                console.error("[Gemini] API error response:", JSON.stringify(error.response.data, null, 2));
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
     */
    private async generateWithPollinations(
        params: ImageGenerationParams
    ): Promise<ImageGenerationResult> {
        const { prompt, width = 1024, height = 1024, seed } = params;

        // Build URL with parameters
        const baseUrl = "https://image.pollinations.ai/prompt";
        let url = `${baseUrl}/${encodeURIComponent(prompt)}`;

        // Add optional parameters
        const queryParams: string[] = [];
        if (width) queryParams.push(`width=${width}`);
        if (height) queryParams.push(`height=${height}`);
        if (seed) queryParams.push(`seed=${seed}`);
        queryParams.push("nologo=true"); // Remove watermark
        queryParams.push("enhance=true"); // Better quality

        if (queryParams.length > 0) {
            url += `?${queryParams.join("&")}`;
        }

        // Pollinations returns the image directly, no API call needed
        // Just verify the URL is accessible
        try {
            const response = await axios.head(url, { timeout: 30000 }); // Increased to 30 seconds
            if (response.status === 200) {
                return {
                    url,
                    provider: "pollinations",
                    seed,
                    width,
                    height,
                };
            }
            throw new Error("Image URL not accessible");
        } catch (error) {
            throw new Error(`Pollinations failed: ${error}`);
        }
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
    /**
     * Google Gemini - Text generation
     */
    async generateText(prompt: string): Promise<string> {
        if (!this.geminiKey) {
            throw new Error("Gemini API key not configured");
        }

        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

        try {
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
            if (!text) throw new Error("No text generated");

            return text;
        } catch (error: any) {
            console.error("[Gemini Text] Error:", error.response?.data || error.message);
            throw new Error(`Gemini Text Generation failed: ${error.message}`);
        }
    }
}

// Export singleton instance
export const aiImageService = new AIImageService();
