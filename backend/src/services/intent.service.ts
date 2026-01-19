import { aiImageService } from "./ai-image.service";
import logger from "../utils/logger";

export type GenerationIntent = "cinematic" | "realistic" | "abstract" | "informational" | "social_media" | "professional";
export type AssetType = "image" | "video" | "text" | "campaign";

export interface IntentAnalysis {
    intent: GenerationIntent;
    suggestedProvider: string;
    complexity: "low" | "medium" | "high";
    recommendations: string[];
    enhancedPrompt?: string;
}

class IntentService {
    /**
     * Analyze a prompt to determine user intent and best generation strategy
     */
    async analyzeIntent(prompt: string, type: AssetType): Promise<IntentAnalysis> {
        try {
            // If Gemini is key is missing, return a basic bypass analysis to save costs/time
            if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "api_key_missing") {
                return this.fallbackAnalysis(prompt, type);
            }

            const analysisPrompt = `Analyze the intent of this AI generation prompt. 
Prompt: "${prompt}"
Type: ${type}

Output valid JSON ONLY. Structure:
{
  "intent": "cinematic" | "realistic" | "abstract" | "informational" | "social_media" | "professional",
  "complexity": "low" | "medium" | "high",
  "suggestedProvider": "string",
  "recommendations": ["string"]
}`;

            const response = await aiImageService.generateText(analysisPrompt);
            const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const results = JSON.parse(cleaned);
                return {
                    ...results,
                    intent: results.intent || "cinematic"
                };
            } catch (e) {
                logger.warn("[Intent Service] JSON parse failed, using fallback");
                return this.fallbackAnalysis(prompt, type);
            }
        } catch (error) {
            logger.error("[Intent Service] Analysis failed:", error);
            return this.fallbackAnalysis(prompt, type);
        }
    }

    private fallbackAnalysis(prompt: string, type: AssetType): IntentAnalysis {
        const lowerPrompt = prompt.toLowerCase();
        let intent: GenerationIntent = "cinematic";

        if (lowerPrompt.includes("real") || lowerPrompt.includes("photo")) intent = "realistic";
        else if (lowerPrompt.includes("abstract") || lowerPrompt.includes("art")) intent = "abstract";
        else if (lowerPrompt.includes("business") || lowerPrompt.includes("office")) intent = "professional";
        else if (lowerPrompt.includes("post") || lowerPrompt.includes("ad")) intent = "social_media";

        return {
            intent,
            complexity: "medium",
            suggestedProvider: type === "video" ? "replicate" : "pollinations",
            recommendations: ["Ensure high resolution", "Maintain consistent style"]
        };
    }

    /**
     * Systematic flow for enhancement based on intent
     */
    async getSystematicPrompt(prompt: string, analysis: IntentAnalysis): Promise<string> {
        const modifiers: Record<GenerationIntent, string> = {
            cinematic: "cinematic lighting, 8k, highly detailed, masterpieces, shallow depth of field, anamorphic",
            realistic: "photorealistic, sharp focus, natural colors, raw photo, highly detailed texture",
            abstract: "vibrant colors, artistic, surreal, unique composition, creative atmosphere",
            informational: "clear subjects, clean layout, bright lighting, informative composition",
            social_media: "trendy aesthetic, eye-catching, vibrant, optimized for engagement",
            professional: "minimalist, clean, corporate aesthetic, high-end, premium quality"
        };

        const modifier = modifiers[analysis.intent] || modifiers.cinematic;
        return `${prompt}, ${modifier}. ${analysis.recommendations.join(", ")}`;
    }
}

export const intentService = new IntentService();
export default intentService;
