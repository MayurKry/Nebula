
import { runwayService } from "./runway.service";
import logger from "../utils/logger";

export interface AudioGenerationParams {
    prompt: string;
    model?: string;
    voiceId?: string;
    tone?: string;
}

export interface AudioGenerationResult {
    jobId: string;
    status: "processing" | "succeeded" | "failed";
    audioUrl?: string;
    error?: string;
    creditsUsed?: number;
    estimatedCost?: number;
}

class AIAudioService {
    constructor() {
        logger.info("[AI Audio Service] 🔊 Initialized with Runway ML text_to_speech");
    }

    async generateAudio(params: AudioGenerationParams): Promise<AudioGenerationResult> {
        const originalPrompt = (params.prompt || "").trim();

        logger.info(`[AI Audio Service] Generating speech for: "${originalPrompt.substring(0, 50)}..."`);

        try {
            const result = await runwayService.textToAudio({
                prompt: originalPrompt,
                voiceId: params.voiceId,
                tone: params.tone
            });

            return {
                jobId: `runway_${result.id}`,
                status: "processing",
                creditsUsed: 5,
                estimatedCost: 0.05
            };
        } catch (error: any) {
            console.error("AI Audio Service Error:", error.message);
            throw error; // Throw real error to see it in logs/response
        }
    }

    async checkStatus(jobId: string): Promise<AudioGenerationResult> {
        // Handle Demo Jobs
        if (jobId.startsWith("demo_audio_")) {
            return {
                jobId: jobId,
                status: "succeeded",
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            };
        }

        if (!jobId.startsWith("runway_")) {
            throw new Error(`Invalid audio job ID: ${jobId}`);
        }

        const realId = jobId.replace("runway_", "");
        try {
            const status = await runwayService.checkStatus(realId);

            let audioStatus: AudioGenerationResult["status"] = "processing";
            if (status.status === "SUCCEEDED") audioStatus = "succeeded";
            else if (status.status === "FAILED") audioStatus = "failed";

            return {
                jobId: jobId,
                status: audioStatus,
                audioUrl: status.output && status.output[0],
                error: status.failure
            };
        } catch (error: any) {
            logger.error(`[AI Audio Service] Status check failed for ${realId}:`, error.message);
            throw error;
        }
    }
}

export const aiAudioService = new AIAudioService();
export default aiAudioService;
