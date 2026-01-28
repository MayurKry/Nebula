import logger from "../utils/logger";

/**
 * Prompt Enhancement Service
 * Transforms user's natural language prompts into optimized Runway ML prompts
 * Based on Runway ML best practices for Gen-4 models
 */

export interface PromptIntent {
    subject: string;
    action: string;
    setting: string;
    hasCamera: boolean;
    hasLighting: boolean;
    hasMood: boolean;
}

class PromptEnhancerService {
    // Camera shot types
    private readonly cameraShots = [
        "close-up", "medium shot", "wide shot", "extreme close-up",
        "aerial view", "tracking shot", "pan", "zoom", "bird's eye view",
        "low angle", "high angle", "over the shoulder"
    ];

    // Lighting keywords
    private readonly lightingTerms = [
        "warm lighting", "golden hour", "soft shadows", "dramatic lighting",
        "natural light", "studio lighting", "backlit", "rim lighting",
        "ambient light", "diffused light", "harsh shadows", "sunset glow"
    ];

    // Mood/atmosphere keywords
    private readonly moodTerms = [
        "cinematic", "peaceful", "energetic", "mysterious", "dramatic",
        "serene", "vibrant", "moody", "ethereal", "dynamic", "calm",
        "intense", "dreamy", "realistic", "artistic", "vintage", "futuristic"
    ];

    // Movement keywords for video
    private readonly movementTerms = [
        "slow motion", "natural movement", "dynamic action", "gentle motion",
        "smooth movement", "flowing", "static", "subtle movement", "fast-paced"
    ];

    // Conversational phrases to remove
    private readonly conversationalPhrases = [
        "can you", "please", "i want", "i need", "make a", "create a",
        "generate a", "show me", "give me", "could you", "would you"
    ];

    /**
     * Enhance image prompt
     */
    enhanceImagePrompt(userPrompt: string): string {
        logger.info(`[PromptEnhancer] Original image prompt: "${userPrompt}"`);

        // Clean the prompt
        let enhanced = this.cleanPrompt(userPrompt);

        // Analyze intent
        const intent = this.analyzeIntent(enhanced);

        // Add missing elements for images
        if (!intent.hasLighting) {
            enhanced = this.addLighting(enhanced);
        }

        if (!intent.hasMood) {
            enhanced = this.addMood(enhanced);
        }

        // Convert to positive phrasing
        enhanced = this.convertToPositive(enhanced);

        // Ensure direct, visual language
        enhanced = this.makeVisual(enhanced);

        logger.info(`[PromptEnhancer] Enhanced image prompt: "${enhanced}"`);
        return enhanced;
    }

    /**
     * Enhance video prompt with structured format
     */
    enhanceVideoPrompt(userPrompt: string): string {
        logger.info(`[PromptEnhancer] Original video prompt: "${userPrompt}"`);

        // Clean the prompt
        let enhanced = this.cleanPrompt(userPrompt);

        // Analyze intent
        const intent = this.analyzeIntent(enhanced);

        // Build structured prompt: [camera]: [scene]. [details]
        let structuredPrompt = "";

        // Add camera details if missing
        if (!intent.hasCamera) {
            const cameraShot = this.selectCameraShot(intent);
            structuredPrompt = `${cameraShot}: `;
        }

        // Add the main scene (convert to present tense, active voice)
        structuredPrompt += this.makeVisual(enhanced);

        // Add additional details (lighting, mood, movement)
        const details: string[] = [];

        if (!intent.hasLighting) {
            details.push(this.selectLighting(intent));
        }

        if (!intent.hasMood) {
            details.push(this.selectMood(intent));
        }

        // Add movement for video
        const movement = this.selectMovement(intent);
        if (movement) {
            details.push(movement);
        }

        if (details.length > 0) {
            structuredPrompt += `. ${details.join(", ")}`;
        }

        // Convert to positive phrasing
        structuredPrompt = this.convertToPositive(structuredPrompt);

        logger.info(`[PromptEnhancer] Enhanced video prompt: "${structuredPrompt}"`);
        return structuredPrompt;
    }

    /**
     * Clean prompt by removing conversational phrases
     */
    private cleanPrompt(prompt: string): string {
        let cleaned = prompt.toLowerCase().trim();

        // Remove conversational phrases
        this.conversationalPhrases.forEach(phrase => {
            const regex = new RegExp(`\\b${phrase}\\b`, "gi");
            cleaned = cleaned.replace(regex, "");
        });

        // Remove extra spaces
        cleaned = cleaned.replace(/\s+/g, " ").trim();

        // Capitalize first letter
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

        return cleaned;
    }

    /**
     * Analyze prompt to understand intent and existing elements
     */
    private analyzeIntent(prompt: string): PromptIntent {
        const lowerPrompt = prompt.toLowerCase();

        return {
            subject: this.extractSubject(lowerPrompt),
            action: this.extractAction(lowerPrompt),
            setting: this.extractSetting(lowerPrompt),
            hasCamera: this.cameraShots.some(shot => lowerPrompt.includes(shot)),
            hasLighting: this.lightingTerms.some(term => lowerPrompt.includes(term)),
            hasMood: this.moodTerms.some(term => lowerPrompt.includes(term))
        };
    }

    /**
     * Extract subject from prompt
     */
    private extractSubject(prompt: string): string {
        // Simple extraction - first noun phrase
        const words = prompt.split(" ");
        return words.slice(0, 3).join(" ");
    }

    /**
     * Extract action from prompt
     */
    private extractAction(prompt: string): string {
        const actionVerbs = ["walking", "running", "eating", "dancing", "flying", "swimming", "sitting", "standing"];
        const found = actionVerbs.find(verb => prompt.includes(verb));
        return found || "moving";
    }

    /**
     * Extract setting from prompt
     */
    private extractSetting(prompt: string): string {
        const settings = ["garden", "beach", "city", "forest", "room", "street", "mountain", "ocean"];
        const found = settings.find(setting => prompt.includes(setting));
        return found || "outdoor";
    }

    /**
     * Select appropriate camera shot based on intent
     */
    private selectCameraShot(intent: PromptIntent): string {
        // Default to medium shot for most cases
        if (intent.subject.includes("face") || intent.subject.includes("person")) {
            return "Medium shot";
        }
        if (intent.setting.includes("landscape") || intent.setting.includes("mountain")) {
            return "Wide shot";
        }
        return "Medium shot";
    }

    /**
     * Select appropriate lighting
     */
    private selectLighting(intent: PromptIntent): string {
        if (intent.setting.includes("outdoor") || intent.setting.includes("beach")) {
            return "natural light";
        }
        if (intent.setting.includes("night") || intent.setting.includes("dark")) {
            return "dramatic lighting";
        }
        return "warm lighting";
    }

    /**
     * Select appropriate mood
     */
    private selectMood(intent: PromptIntent): string {
        if (intent.action.includes("running") || intent.action.includes("dancing")) {
            return "energetic";
        }
        if (intent.setting.includes("beach") || intent.setting.includes("garden")) {
            return "peaceful";
        }
        return "cinematic";
    }

    /**
     * Select appropriate movement for video
     */
    private selectMovement(intent: PromptIntent): string {
        if (intent.action.includes("running") || intent.action.includes("flying")) {
            return "dynamic action";
        }
        if (intent.action.includes("walking") || intent.action.includes("sitting")) {
            return "natural movement";
        }
        return "smooth movement";
    }

    /**
     * Add lighting to prompt
     */
    private addLighting(prompt: string): string {
        return `${prompt}, warm lighting`;
    }

    /**
     * Add mood to prompt
     */
    private addMood(prompt: string): string {
        return `${prompt}, cinematic`;
    }

    /**
     * Convert to positive phrasing
     */
    private convertToPositive(prompt: string): string {
        // Replace negative phrases with positive ones
        let positive = prompt
            .replace(/no clouds/gi, "clear sky")
            .replace(/no rain/gi, "sunny weather")
            .replace(/no people/gi, "empty scene")
            .replace(/not dark/gi, "bright")
            .replace(/not blurry/gi, "sharp focus");

        return positive;
    }

    /**
     * Make prompt more visual and direct
     */
    private makeVisual(prompt: string): string {
        // Convert to present tense if needed
        let visual = prompt
            .replace(/will be/gi, "is")
            .replace(/would be/gi, "is")
            .replace(/should be/gi, "is");

        // Remove question marks
        visual = visual.replace(/\?/g, ".");

        return visual;
    }
}

export const promptEnhancer = new PromptEnhancerService();
export default promptEnhancer;
