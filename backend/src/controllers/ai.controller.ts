import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { responseHandler } from "../utils/responseHandler";
import { aiImageService } from "../services/ai-image.service";
import { aiVideoService } from "../services/ai-video.service";
import { aiAudioService } from "../services/ai-audio.service";
import { ActivityService } from "../services/activity.service";
import { NotificationService } from "../services/notification.service";
import { AssetModel } from "../models/asset.model";
import { GenerationHistoryModel } from "../models/generation-history.model";
import { intentService } from "../services/intent.service";
import { LoggingService } from "../services/logging.service";
import { jobService } from "../services/job.service";
import mongoose from "mongoose";

// Extend Request type to include user (if not already globally defined, but here for safety/clarity in this file scope)
interface AuthenticatedRequest extends Request {
    user?: any;
}
export const generateImage = asyncHandler(async (req: Request, res: Response) => {
    const {
        prompt,
        style,
        width = 1024,
        height = 1024,
        seed,
        negativePrompt,
        count = 1,
        aspectRatio,
        cameraAngle
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
        return responseHandler(res, 400, "Prompt is required and must be a string");
    }

    // Systematic Flow Step 1: Analyze Intent
    console.log(`[Systematic Flow] Analyzing intent for prompt starting with: "${prompt.substring(0, 30)}..."`);
    const intentAnalysis = await intentService.analyzeIntent(prompt, "image");

    // Systematic Flow Step 2: Intent-based Enhancement
    const systematicPrompt = await intentService.getSystematicPrompt(prompt, intentAnalysis);
    console.log(`[Systematic Flow] Intent: ${intentAnalysis.intent}, Complexity: ${intentAnalysis.complexity}`);

    const userId = (req as any).user?.userId || (req as any).user?.id || (req as any).user?._id;

    try {
        // Systematic Flow Step 3: Optimized Execution
        const imageCount = Math.min(Math.max(1, count), 4);
        const startTime = Date.now();

        const promises = Array.from({ length: imageCount }, (_, index) => {
            const imageSeed = seed ? (Number(seed) + index) : Math.floor(Math.random() * 1000000) + index;

            return aiImageService.generateImage({
                prompt: systematicPrompt,
                style: style || intentAnalysis.intent,
                width: Number(width),
                height: Number(height),
                seed: imageSeed,
                negativePrompt
            });
        });

        const results = await Promise.all(promises);
        const latencyMs = Date.now() - startTime;

        // Save generated assets to database
        const savedAssets: any[] = [];

        if (userId) {
            // Synchronize with Job system for History/Activity visibility
            try {
                const { JobModel } = await import("../models/job.model");
                await JobModel.create({
                    userId: new mongoose.Types.ObjectId(userId),
                    module: "text_to_image",
                    status: "completed",
                    input: {
                        prompt,
                        config: { style, width, height, seed, aspectRatio }
                    },
                    output: results.map(r => ({
                        type: "image",
                        url: r.url,
                        metadata: { width: r.width, height: r.height, provider: "nebula-locked" }
                    })),
                    queuedAt: new Date(startTime),
                    startedAt: new Date(startTime),
                    completedAt: new Date(),
                    creditsUsed: results.length
                });
            } catch (err) {
                console.warn("[Image Generation] Job sync failed:", err);
            }
            const { downloadAndSaveFile } = await import("../utils/fileDownloader");

            const assetPromises = results.map(async result => {
                let permanentUrl = result.url;
                try {
                    permanentUrl = await downloadAndSaveFile(result.url, 'image');
                } catch (e) {
                    console.error("Failed to download image asset:", e);
                }

                return AssetModel.create({
                    name: prompt,
                    type: "image",
                    url: permanentUrl,
                    thumbnailUrl: permanentUrl,
                    userId: new mongoose.Types.ObjectId(userId),
                    metadata: {
                        width: result.width,
                        height: result.height,
                        format: "png",
                        provider: result.provider,
                        model: intentAnalysis.model
                    },
                    tags: ["ai-generated", style || "default", "nebular-locked"]
                });
            });
            const assets = await Promise.all(assetPromises);
            savedAssets.push(...assets);

            // Save to generation history
            await GenerationHistoryModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                type: "image",
                prompt,
                settings: {
                    style: style || intentAnalysis.intent,
                    width: Number(width),
                    height: Number(height),
                    aspectRatio: aspectRatio || '1:1',
                    seed: seed ? Number(seed) : undefined,
                    cameraAngle: cameraAngle || 'eye-level',
                    negativePrompt: negativePrompt || '',
                    count: imageCount,
                    model: intentAnalysis.model
                },
                results: results.map((result, index) => ({
                    assetId: savedAssets[index]?._id,
                    url: result.url,
                    thumbnailUrl: result.url,
                    provider: result.provider
                })),
                provider: results[0]?.provider,
                status: "completed"
            });

            // Log activity
            await ActivityService.logActivity({
                userId: userId as any,
                type: "generation",
                action: "Image Generation",
                description: `Generated ${imageCount} image(s) via ${results[0].provider} using locked enterprise model.`,
                metadata: {
                    provider: results[0]?.provider,
                    model: intentAnalysis.model,
                    count: imageCount,
                    style
                },
                status: "success",
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            // Calculate exact cost for observability
            const unitCost = results[0].provider === 'runway' ? 0.01 : 0.002;

            // Log for Super Admin Observability
            await LoggingService.createGenerationLog({
                generationId: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                tenantId: (req as any).user?.tenantId,
                userId: userId,
                feature: 'Text-to-Image',
                inputType: 'text',
                status: 'COMPLETED',
                creditsConsumed: 2 * imageCount,
                costIncurred: unitCost * imageCount,
                provider: results[0]?.provider,
                aiModel: intentAnalysis.model || 'runway-basic',
                latencyMs: latencyMs
            });
        }

        return responseHandler(res, 200, "Images generated successfully", {
            images: results.map(result => ({
                url: result.url,
                width: result.width,
                height: result.height,
                seed: result.seed,
                provider: result.provider,
            })),
            prompt,
            style,
            count: results.length,
            provider: results[0]?.provider,
            generatedAt: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("Image generation error:", error);

        // Save failed generation to history
        if (userId) {
            // Log Error for Observability
            await LoggingService.createErrorLog({
                tenantId: (req as any).user?.tenantId,
                userId: userId,
                category: error.message.includes('credit') ? 'CREDIT' : 'PROVIDER',
                feature: 'Text-to-Image',
                message: error.message,
                stackTrace: error.stack,
                retryCount: 0,
                resolved: false
            });

            // Log failed generation
            await LoggingService.createGenerationLog({
                generationId: `gen_fail_${Date.now()}`,
                tenantId: (req as any).user?.tenantId,
                userId: userId,
                feature: 'Text-to-Image',
                inputType: 'text',
                status: 'FAILED',
                creditsConsumed: 0,
                costIncurred: 0,
                provider: 'flux-pro',
                aiModel: style || 'default',
                latencyMs: 0
            });

            await GenerationHistoryModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                type: "image",
                prompt,
                settings: {
                    style: style || 'default',
                    width: Number(width),
                    height: Number(height),
                    aspectRatio: aspectRatio || '1:1',
                    seed: seed ? Number(seed) : undefined,
                    negativePrompt: negativePrompt || '',
                    count
                },
                results: [],
                status: "failed",
                error: error.message
            });
        }

        // Provide more detailed error message
        const errorMessage = error.message || "Failed to generate image";

        // Critical: Do NOT return 401/403 here even if the external provider gave it. 
        // 401 tells the frontend "User is not logged in", causing a redirect to home.
        // We want to tell the frontend "The server failed to process the request".
        const statusCode = 500;

        return responseHandler(res, statusCode, errorMessage);
    }
});

// Get available AI providers
export const getAIProviders = asyncHandler(async (req: Request, res: Response) => {
    const availableProviders = aiImageService.getAvailableProviders();

    return responseHandler(res, 200, "AI providers retrieved successfully", {
        providers: availableProviders,
        total: availableProviders.length,
        primary: availableProviders[0] || "none",
    });
});

// Real AI Video Generation (Text-to-Video)
export const generateVideo = asyncHandler(async (req: Request, res: Response) => {
    let userId: any;
    let prompt: string = "";
    let style: string = "Cinematic";
    let duration: number = 6;
    let job: any = null;

    try {
        const body = req.body;
        prompt = body.prompt;
        const model = body.model || "gen3a_turbo";
        style = body.style || "Cinematic";
        duration = body.duration || 6;

        if (!prompt) {
            return responseHandler(res, 400, "Prompt is required");
        }

        userId = (req as AuthenticatedRequest).user?.userId || (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).user?._id;

        if (!userId) {
            return responseHandler(res, 401, "Unauthorized: User identification failed");
        }

        // 1. Create Job & Deduct Credits
        // This ensures the user has enough credits BEFORE we call the expensive AI service
        job = await jobService.createJob({
            userId: userId.toString(),
            module: "text_to_video",
            input: {
                prompt,
                config: { style, duration, model }
            },
            skipProcessing: true // <--- IMPORTANT: Prevent double generation
        });

        // 2. Call AI Video Service
        const result = await aiVideoService.generateVideo({
            prompt: prompt,
            model: model,
            style: style,
            duration: duration
        });

        // 3. Update available job with provider metadata
        // We use the job created in step 1 instead of creating a new one
        job.status = "processing";
        job.metadata = {
            ...(job.metadata || {}),
            jobId: result.jobId,
            provider: "runwayml_proxy",
            originalCreditsCost: result.creditsUsed
        };
        job.startedAt = new Date();
        await job.save();

        // Also save to generation history for legacy support if needed
        await GenerationHistoryModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            type: "video",
            prompt,
            settings: {
                style,
                duration,
                model: "Nebula Video Base",
                provider: "runwayml"
            },
            results: [{
                jobId: result.jobId,
                url: "",
                thumbnailUrl: result.thumbnailUrl,
                status: result.status
            }],
            status: "processing"
        });

        return responseHandler(res, 200, "Video generation started", {
            jobId: result.jobId,
            prompt,
            style,
            duration,
            status: result.status,
            estimatedTime: 30,
            thumbnailUrl: result.thumbnailUrl,
        });

    } catch (error: any) {
        console.error("Video generation failed:", error.message, error.stack);

        // Auto-Refund Logic: Return credits if generation fails
        if (job && userId) {
            try {
                const { UserModel } = await import("../models/user.model");
                const { JobModel } = await import("../models/job.model");

                if (job.creditsUsed > 0) {
                    await UserModel.findByIdAndUpdate(userId, { $inc: { credits: job.creditsUsed } });
                    console.log(`[Auto-Refund] Returned ${job.creditsUsed} credits to ${userId} for failed job ${job._id}`);
                }

                await JobModel.findByIdAndUpdate(job._id, {
                    status: 'failed',
                    error: { message: error.message, code: 'GENERATION_FAILED', timestamp: new Date(), refunded: true }
                });
            } catch (refundError) {
                console.error("Failed to process auto-refund:", refundError);
            }
        }

        // Log to file for visibility
        try {
            const fs = require('fs');
            const path = require('path');
            fs.appendFileSync(path.join(process.cwd(), 'debug_error.log'), `[${new Date().toISOString()}] 500 ERROR: ${error.message}\n${error.stack}\n\n`);
        } catch (e) { }

        return responseHandler(res, 500, "Failed to start video generation", { error: error.message });
    }
});

// Check video generation status
export const checkVideoStatus = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const userId = (req as AuthenticatedRequest).user?.userId || (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).user?._id;

    try {
        const result = await aiVideoService.checkStatus(jobId);

        // If video is successful, save to Assets and update Jobs/History
        if (userId && (result.status === 'succeeded' || result.status === 'failed')) {
            const { JobModel } = await import("../models/job.model");

            if (result.status === 'succeeded' && result.videoUrl) {
                // Check if already saved to assets (deduplication)
                const existingAsset = await AssetModel.findOne({ url: result.videoUrl });
                let assetId;

                if (!existingAsset) {
                    // Download and save locally
                    const { downloadAndSaveFile } = await import("../utils/fileDownloader");
                    let permanentVideoUrl = result.videoUrl;
                    let permanentThumbnailUrl = result.thumbnailUrl || result.videoUrl;

                    try {
                        permanentVideoUrl = await downloadAndSaveFile(result.videoUrl, 'video');
                        if (result.thumbnailUrl && result.thumbnailUrl !== result.videoUrl) {
                            permanentThumbnailUrl = await downloadAndSaveFile(result.thumbnailUrl, 'thumb');
                        } else {
                            permanentThumbnailUrl = permanentVideoUrl; // Use video as thumb if same
                        }
                    } catch (dlError) {
                        console.error("Failed to download video asset, utilizing original URL:", dlError);
                    }

                    const asset = await AssetModel.create({
                        name: `Video Generation ${jobId}`,
                        type: "video",
                        url: permanentVideoUrl,
                        thumbnailUrl: permanentThumbnailUrl,
                        userId: new mongoose.Types.ObjectId(userId),
                        metadata: { format: "mp4" },
                        tags: ["ai-video", "generated"]
                    });
                    assetId = asset._id;
                } else {
                    assetId = existingAsset._id;
                }

                // Update the JobModel so it shows in History/Activity
                await JobModel.findOneAndUpdate(
                    { "metadata.jobId": jobId },
                    {
                        status: "completed",
                        completedAt: new Date(),
                        output: [{
                            type: "video",
                            url: result.videoUrl,
                            metadata: { provider: "runwayml", assetId }
                        }]
                    }
                );

                // Update generation history with completed video
                await GenerationHistoryModel.findOneAndUpdate(
                    { userId: new mongoose.Types.ObjectId(userId), "results.jobId": jobId },
                    {
                        $set: {
                            status: "completed",
                            "results.$.url": result.videoUrl,
                            "results.$.thumbnailUrl": result.thumbnailUrl,
                            "results.$.assetId": assetId,
                            "results.$.status": "succeeded"
                        }
                    }
                );
            } else if (result.status === 'failed') {
                // Update Job as failed
                await JobModel.findOneAndUpdate(
                    { "metadata.jobId": jobId },
                    {
                        status: "failed",
                        error: { message: result.error || "Generation failed", timestamp: new Date() }
                    }
                );
            }
        }

        return responseHandler(res, 200, "Video status retrieved", {
            jobId: result.jobId,
            status: result.status,
            videoUrl: result.videoUrl,
            thumbnailUrl: result.thumbnailUrl,
            error: result.error
        });
    } catch (error: any) {
        console.error("Failed to check video status:", error);
        return responseHandler(res, 500, "Failed to check video status");
    }
});

// Generate Full Video Project (Script -> Storyboard -> Video)
export const generateVideoProject = asyncHandler(async (req: Request, res: Response) => {
    const { prompt, style, duration = 30 } = req.body;

    if (!prompt) {
        return responseHandler(res, 400, "Prompt is required");
    }

    // Systematic Flow Step 1: Analyze Intent
    console.log(`[Systematic Flow] Analyzing project intent for: "${prompt.substring(0, 30)}..."`);
    const intentAnalysis = await intentService.analyzeIntent(prompt, "video");

    // Systematic Flow Step 2: Intent-based Style
    const projectStyle = style || intentAnalysis.intent;

    // Use Gemini to generate the project structure
    try {
        const systemSystem = `Act as an AI Video Director. Create a video plan for: Style: ${projectStyle}, Duration: ${duration}s.
Output valid JSON only. Structure:
{
  "script": "full script",
  "language": "English",
  "region": "US",
  "characters": [{ "id": "char_1", "name": "name", "bio": "bio", "accent": "accent", "voiceId": "voiceId" }],
  "scenes": [{ "id": "scene_1", "order": 0, "description": "visual prompt", "duration": seconds, "cameraPath": "Static/Pan/Zoom/Orbit", "motionIntensity": 1-100 }]
}`;

        const userPrompt = `Project Prompt: "${prompt}"`;

        console.log("[VideoProject] Generating script with Gemini...");
        // Call Gemini for Script
        let rawContent = await aiImageService.generateText(`${systemSystem}\n\n${userPrompt}`);

        // Clean JSON formatting (remove markdown blocks if present)
        rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

        // Find the first '{' and last '}' to ensure valid JSON substring
        const firstBrace = rawContent.indexOf('{');
        const lastBrace = rawContent.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            rawContent = rawContent.substring(firstBrace, lastBrace + 1);
        }

        let generatedData;
        try {
            generatedData = JSON.parse(rawContent);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", rawContent);
            throw new Error("AI returned invalid project structure. Please try again.");
        }

        // Enhance with Real AI Images (Gemini Imagen)
        console.log(`[VideoProject] Generating visuals for ${generatedData.scenes.length} scenes...`);

        // Process scenes in parallel (limit to 6 to avoid hitting rate limits too hard/timeouts)
        const scenePromises = generatedData.scenes.slice(0, 6).map(async (scene: any, index: number) => {
            // Generate clear visual description
            let visualPrompt = `${style} style. ${scene.description}. High quality, cinematic lighting, 4k.`;

            // Clean prompt of double dots or other potential URL issues
            visualPrompt = visualPrompt.replace(/\.\.+/g, '.').replace(/\s+/g, ' ').trim();

            let imageResult;
            try {
                imageResult = await aiImageService.generateImage({
                    prompt: visualPrompt,
                    width: 1280,
                    height: 720,
                    style: style
                });
            } catch (imageErr) {
                console.warn(`[VideoProject] Failed to generate image for scene ${index + 1}, using placeholder:`, imageErr);
                imageResult = {
                    url: `https://placehold.co/1280x720/1a1a1a/ffffff?text=Scene+${index + 1}`,
                    provider: 'placeholder',
                    width: 1280,
                    height: 720
                };
            }

            return {
                ...scene,
                id: scene.id || `scene_${index + 1}`,
                order: index,
                imageUrl: imageResult.url,
                type: 'video',
                cameraPath: scene.cameraPath || "Static",
                motionIntensity: scene.motionIntensity || 50
            };
        });

        // Wait for all scenes to complete - if any fail, the whole generation fails
        const scenes = await Promise.all(scenePromises);

        // Process remaining scenes if more than 6 (to avoid timeout)
        if (generatedData.scenes.length > 6) {
            const remainingPromises = generatedData.scenes.slice(6).map(async (scene: any, index: number) => {
                let visualPrompt = `${style} style. ${scene.description}. High quality, cinematic lighting, 4k.`;

                // Clean prompt
                visualPrompt = visualPrompt.replace(/\.\.+/g, '.').replace(/\s+/g, ' ').trim();

                let imageResult;
                try {
                    imageResult = await aiImageService.generateImage({
                        prompt: visualPrompt,
                        width: 1280,
                        height: 720,
                        style: style
                    });
                } catch (imageErr) {
                    console.warn(`[VideoProject] Failed to generate image for remaining scene ${index + 7}:`, imageErr);
                    imageResult = {
                        url: `https://placehold.co/1280x720/1a1a1a/ffffff?text=Scene+${index + 7}`,
                        provider: 'placeholder',
                        width: 1280,
                        height: 720
                    };
                }

                return {
                    ...scene,
                    id: scene.id || `scene_${index + 7}`,
                    order: index + 6,
                    imageUrl: imageResult.url,
                    type: 'video',
                    cameraPath: scene.cameraPath || "Static",
                    motionIntensity: scene.motionIntensity || 50
                };
            });

            const remainingScenes = await Promise.all(remainingPromises);
            scenes.push(...remainingScenes);
        }

        const characters = generatedData.characters.map((char: any, index: number) => ({
            ...char,
            id: char.id || `char_${index + 1}`,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random&size=128`,
            voiceId: char.voiceId || "voice_en_us_neutral"
        }));

        // Mock Audio Tracks based on generated scenes
        const audioTracks = [
            {
                id: "track_music_1",
                type: "music",
                name: "AI Generated Score",
                startTime: 0,
                duration: duration,
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                volume: 0.5
            },
            ...(characters.length > 0 ? [{
                id: "track_voice_1",
                type: "voice",
                name: `${characters[0].name} (Intro)`,
                startTime: 0,
                duration: scenes[0]?.duration || 5,
                characterId: characters[0].id,
                url: "#",
                volume: 1.0
            }] : [])
        ];

        const projectData = {
            projectId: `proj_${Date.now()}`,
            prompt,
            settings: {
                style,
                duration,
                language: generatedData.language || "English",
                region: generatedData.region || "US",
                aspectRatio: "16:9"
            },
            script: generatedData.script || "",
            scenes,
            characters,
            tracks: audioTracks,
            createdAt: new Date().toISOString(),
        };

        // Save to generation history
        const userId = (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).user?._id;
        if (userId) {
            await GenerationHistoryModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                type: "video-project",
                prompt,
                settings: {
                    style,
                    duration,
                    aspectRatio: "16:9"
                },
                results: scenes.map(s => ({
                    url: s.imageUrl,
                    thumbnailUrl: s.imageUrl,
                    status: "completed"
                })),
                status: "completed"
            });

            // Log activity
            await ActivityService.logActivity({
                userId: userId as any,
                type: "generation",
                action: "Project Generation",
                description: `Created a full video project with ${scenes.length} scenes based on: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`,
                metadata: {
                    projectId: projectData.projectId,
                    sceneCount: scenes.length,
                    duration
                },
                status: "success",
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            // Log for Super Admin
            await LoggingService.createGenerationLog({
                generationId: `camp_${Date.now()}`,
                tenantId: (req as any).user?.tenantId,
                userId: userId,
                feature: 'Campaign Wizard',
                inputType: 'text',
                status: 'COMPLETED',
                creditsConsumed: scenes.length * 5,
                costIncurred: scenes.length * 0.02,
                provider: 'gemini-1.5-pro',
                aiModel: 'video-director',
                latencyMs: 8000,
                campaignId: projectData.projectId
            });
        }

        return responseHandler(res, 200, "Project generated successfully", projectData);

    } catch (error: any) {
        console.error("Gemini Project Generation Failed:", error);

        // Return proper error instead of mock data
        // This gives users honest feedback about service availability
        return responseHandler(res, 503, "AI service temporarily unavailable. Please try again in a few moments.", {
            error: error.message,
            suggestion: "Our AI service is currently experiencing high demand or quota limits. Please try again shortly."
        });
    }
});


// Mock Storyboard Generation
export const generateStoryboard = asyncHandler(async (req: Request, res: Response) => {
    // Maintenance Mode
    return responseHandler(res, 503, "System is under maintenance. AI generation is temporarily disabled.");

    const { script, scenes = 6 } = req.body;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Generate mock scene data
    const storyboardScenes = Array.from({ length: scenes }, (_, i) => ({
        sceneNumber: i + 1,
        description: `Scene ${i + 1} - ${script?.slice(0, 50) || "Auto-generated scene"}...`,
        imageUrl: `https://picsum.photos/seed/${Date.now() + i}/400/225`,
        duration: 3 + Math.random() * 5,
        cameraAngle: ["wide", "medium", "close-up", "aerial"][Math.floor(Math.random() * 4)],
    }));

    return responseHandler(res, 200, "Storyboard generated successfully", {
        scenes: storyboardScenes,
        totalDuration: storyboardScenes.reduce((acc, s) => acc + s.duration, 0),
    });
});

// Update user onboarding
export const updateOnboarding = asyncHandler(async (req: Request, res: Response) => {
    const { industry, useCase, skillLevel } = req.body;
    const userId = req.user?._id;

    // Import UserModel here to avoid circular dependency
    const { UserModel } = await import("../models/user.model");

    const user = await UserModel.findByIdAndUpdate(
        userId,
        {
            industry,
            useCase,
            skillLevel,
            onboardingCompleted: true,
        },
        { new: true }
    ).select("-password -refreshToken");

    if (!user) {
        return responseHandler(res, 404, "User not found");
    }

    // Log activity
    await ActivityService.logActivity({
        userId: userId as any,
        type: "profile_update",
        action: "Onboarding Completed",
        description: "Successfully completed the account onboarding process.",
        metadata: {
            industry,
            useCase,
            skillLevel
        },
        status: "success",
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    return responseHandler(res, 200, "Onboarding completed", user);
});

// Regenerate a single scene image
export const regenerateScene = asyncHandler(async (req: Request, res: Response) => {
    const { description, style, width = 1280, height = 720 } = req.body;

    if (!description) {
        return responseHandler(res, 400, "Scene description is required");
    }

    try {
        // Systematic Flow Step 1: Analyze Intent
        const intentAnalysis = await intentService.analyzeIntent(description, "image");

        // Systematic Flow Step 2: Intent-based Enhancement
        const systematicPrompt = await intentService.getSystematicPrompt(description, intentAnalysis);

        const result = await aiImageService.generateImage({
            prompt: systematicPrompt,
            width: Number(width),
            height: Number(height),
            style: style || intentAnalysis.intent
        });

        return responseHandler(res, 200, "Scene regenerated successfully", {
            imageUrl: result.url,
            provider: result.provider
        });
    } catch (error: any) {
        console.error("Scene regeneration failed:", error);
        return responseHandler(res, 500, "Failed to regenerate scene", {
            error: error.message
        });
    }
});

// Animate a scene (Image-to-Video)
export const animateScene = asyncHandler(async (req: Request, res: Response) => {
    const { imageUrl, prompt, model, duration, motionLevel, cameraPath } = req.body;

    if (!imageUrl) {
        return responseHandler(res, 400, "Image URL is required");
    }

    const userId = (req as AuthenticatedRequest).user?.userId || (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).user?._id;
    if (!userId) {
        return responseHandler(res, 401, "Unauthorized");
    }

    try {
        let finalPrompt = prompt;

        if (prompt) {
            // Systematic Flow Step 1: Analyze Intent
            const intentAnalysis = await intentService.analyzeIntent(prompt, "video");

            // Systematic Flow Step 2: Intent-based Enhancement
            finalPrompt = await intentService.getSystematicPrompt(prompt, intentAnalysis);
        }

        // 1. Create Job & Deduct Credits
        const job = await jobService.createJob({
            userId: userId.toString(),
            module: "image_to_video",
            input: {
                prompt: finalPrompt,
                config: { model, duration, imageUrl, motionLevel, cameraPath }
            }
        });

        const result = await aiVideoService.animateImage(imageUrl, finalPrompt, req.body);

        // 2. Update Job
        job.status = "processing";
        job.metadata = {
            jobId: result.jobId,
            provider: "runwayml_proxy",
            originalCreditsCost: result.creditsUsed
        };
        job.startedAt = new Date();
        await job.save();

        return responseHandler(res, 200, "Animation started", {
            jobId: result.jobId,
            status: result.status,
            thumbnailUrl: result.thumbnailUrl,
            creditsUsed: result.creditsUsed
        });
    } catch (error: any) {
        console.error("Scene animation failed:", error);
        return responseHandler(res, 500, "Failed to animate scene", {
            error: error.message
        });
    }
});

// Get User's Generation History
export const getHistory = asyncHandler(async (req: Request, res: Response) => {
    const userFromToken = (req as AuthenticatedRequest).user;

    console.log('[getHistory] Request received');
    console.log('[getHistory] User from token:', userFromToken);

    // JWT tokens use 'id' field, not '_id'
    const userId = userFromToken?.id || userFromToken?._id;

    console.log('[getHistory] User ID:', userId);

    if (!userId) {
        console.error('[getHistory] No user ID found in request');
        return responseHandler(res, 401, "Unauthorized - No user ID found");
    }

    try {
        const { type, limit = 50, skip = 0 } = req.query;

        const query: any = { userId: new mongoose.Types.ObjectId(userId) };
        if (type && type !== 'all') {
            query.type = type;
        }

        console.log('[getHistory] Query:', JSON.stringify(query));

        const history = await GenerationHistoryModel.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip))
            .lean();

        const total = await GenerationHistoryModel.countDocuments(query);

        console.log('[getHistory] Found', history.length, 'items out of', total, 'total');

        return responseHandler(res, 200, "History retrieved successfully", {
            history: history.map(item => ({
                id: item._id,
                type: item.type,
                prompt: item.prompt,
                settings: item.settings,
                results: item.results,
                provider: item.provider,
                status: item.status,
                error: item.error,
                createdAt: item.createdAt,
            })),
            total,
            limit: Number(limit),
            skip: Number(skip)
        });
    } catch (error: any) {
        console.error("[getHistory] Error:", error);
        return responseHandler(res, 500, "Failed to fetch history");
    }
});

// Get Single History Item Details
export const getHistoryItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?._id;
    const { id } = req.params;

    if (!userId) {
        return responseHandler(res, 401, "Unauthorized");
    }

    try {
        const historyItem = await GenerationHistoryModel.findOne({
            _id: new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId)
        }).lean();

        if (!historyItem) {
            return responseHandler(res, 404, "History item not found");
        }

        return responseHandler(res, 200, "History item retrieved successfully", historyItem);
    } catch (error: any) {
        console.error("Failed to fetch history item:", error);
        return responseHandler(res, 500, "Failed to fetch history item");
    }
});

// Enhance Prompt using AI
export const enhancePrompt = asyncHandler(async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!prompt) {
        return responseHandler(res, 400, "Prompt is required");
    }

    try {
        // Systematic Flow Step 1: Analyze Intent
        const intentAnalysis = await intentService.analyzeIntent(prompt, "image");

        // Systematic Flow Step 2: Intent-based Enhancement
        const systematicPrompt = await intentService.getSystematicPrompt(prompt, intentAnalysis);

        return responseHandler(res, 200, "Prompt enhanced successfully", {
            original: prompt,
            enhanced: systematicPrompt,
            intent: intentAnalysis.intent
        });
    } catch (error: any) {
        console.error("Prompt enhancement failed:", error);
        return responseHandler(res, 500, "Failed to enhance prompt", {
            error: error.message
        });
    }
});

// Generate Audio (Text-to-Speech)
export const generateAudio = asyncHandler(async (req: Request, res: Response) => {
    const { prompt, voiceId } = req.body;
    const userId = (req as AuthenticatedRequest).user?.userId || (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).user?._id;

    if (!prompt) {
        return responseHandler(res, 400, "Prompt is required");
    }

    console.log(`[AudioController] 🎙️ Request received | Prompt: ${prompt.substring(0, 30)}... | VoiceId: ${voiceId}`);

    try {
        const result = await aiAudioService.generateAudio({ prompt, voiceId });

        // Save to history (non-blocking)
        if (userId) {
            try {
                await GenerationHistoryModel.create({
                    userId: new mongoose.Types.ObjectId(userId),
                    type: "audio",
                    prompt,
                    settings: { voiceId },
                    results: [{ jobId: result.jobId, status: result.status }],
                    status: "processing"
                });
            } catch (historyErr) {
                console.warn("Failed to save audio generation to history:", historyErr);
            }
        }

        return responseHandler(res, 200, "Audio generation started", result);
    } catch (error: any) {
        console.error("Audio generation failed detailed:", error.message);
        console.error(error.stack);
        return responseHandler(res, 500, "Failed to generate audio", { error: error.message });
    }
});

// Check Audio Status
export const checkAudioStatus = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).user?._id;

    try {
        const result = await aiAudioService.checkStatus(jobId);

        if (userId && (result.status === 'succeeded' || result.status === 'failed')) {
            await GenerationHistoryModel.findOneAndUpdate(
                { userId: new mongoose.Types.ObjectId(userId), "results.jobId": jobId },
                {
                    $set: {
                        status: result.status === 'succeeded' ? "completed" : "failed",
                        "results.$.url": result.audioUrl,
                        "results.$.status": result.status,
                        error: result.error
                    }
                }
            );
        }

        return responseHandler(res, 200, "Audio status retrieved", result);
    } catch (error: any) {
        console.error("Failed to check audio status:", error);
        return responseHandler(res, 500, "Failed to check audio status");
    }
});
