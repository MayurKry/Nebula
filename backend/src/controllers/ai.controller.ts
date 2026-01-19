import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { responseHandler } from "../utils/responseHandler";
import { aiImageService } from "../services/ai-image.service";
import { aiVideoService } from "../services/ai-video.service";
import { ActivityService } from "../services/activity.service";
import { NotificationService } from "../services/notification.service";
import { AssetModel } from "../models/asset.model";
import { GenerationHistoryModel } from "../models/generation-history.model";
import { intentService } from "../services/intent.service";
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
        count = 2,
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

    const userId = (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).user?._id;

    try {
        // Systematic Flow Step 3: Optimized Execution
        const imageCount = Math.min(Math.max(1, count), 4);

        const promises = Array.from({ length: imageCount }, (_, index) => {
            const imageSeed = seed ? (Number(seed) + index) : Math.floor(Math.random() * 1000000) + index;

            return aiImageService.generateImage({
                prompt: systematicPrompt,
                style: style || intentAnalysis.intent,
                width: Number(width),
                height: Number(height),
                seed: imageSeed,
                negativePrompt,
            });
        });

        const results = await Promise.all(promises);

        // Save generated assets to database
        const savedAssets: any[] = [];

        if (userId) {
            const assetPromises = results.map(result => {
                return AssetModel.create({
                    name: prompt, // Using prompt as the name/title
                    type: "image",
                    url: result.url,
                    thumbnailUrl: result.url, // For images, thumb is the same
                    userId: new mongoose.Types.ObjectId(userId),
                    metadata: {
                        width: result.width,
                        height: result.height,
                        format: "png" // Assuming png for now, or extract from url
                    },
                    tags: ["ai-generated", style || "default"]
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
                    seed: seed || 'random',
                    cameraAngle: cameraAngle || 'eye-level',
                    negativePrompt: negativePrompt || '',
                    count: imageCount
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
                description: `Generated ${imageCount} image(s) with prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`,
                metadata: {
                    provider: results[0]?.provider,
                    count: imageCount,
                    style
                },
                status: "success",
                ip: req.ip,
                userAgent: req.get('user-agent')
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
            await GenerationHistoryModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                type: "image",
                prompt,
                settings: {
                    style: style || 'default',
                    width: Number(width),
                    height: Number(height),
                    aspectRatio: aspectRatio || '1:1',
                    seed: seed || 'random',
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
    const { prompt, style, duration = 3 } = req.body;

    if (!prompt) {
        return responseHandler(res, 400, "Prompt is required");
    }

    // Systematic Flow Step 1: Analyze Intent
    const intentAnalysis = await intentService.analyzeIntent(prompt, "video");

    // Systematic Flow Step 2: Intent-based Enhancement
    const systematicPrompt = await intentService.getSystematicPrompt(prompt, intentAnalysis);

    const userId = (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).user?._id;

    try {
        // Systematic Flow Step 3: Optimized Execution
        const result = await aiVideoService.generateVideo({
            prompt: systematicPrompt,
            style: style || intentAnalysis.intent,
            duration
        });

        // Save to generation history with pending status
        if (userId) {
            await GenerationHistoryModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                type: "video",
                prompt,
                settings: {
                    style,
                    duration
                },
                results: [{
                    jobId: result.jobId,
                    url: "",
                    thumbnailUrl: result.thumbnailUrl,
                    status: result.status
                }],
                status: "processing"
            });

            // Log activity
            await ActivityService.logActivity({
                userId,
                type: "generation",
                action: "Video Generation Started",
                description: `Started video generation with prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`,
                metadata: {
                    jobId: result.jobId,
                    duration
                },
                status: "success",
                ip: req.ip,
                userAgent: req.get('user-agent')
            });
        }

        return responseHandler(res, 200, "Video generation started", {
            jobId: result.jobId,
            prompt,
            style,
            duration,
            status: result.status,
            estimatedTime: 30, // Estimating ~30s for Replicate
            thumbnailUrl: result.thumbnailUrl,
        });
    } catch (error: any) {
        console.error("Video generation failed:", error);

        // Save failed generation to history
        if (userId) {
            await GenerationHistoryModel.create({
                userId: new mongoose.Types.ObjectId(userId),
                type: "video",
                prompt,
                settings: { style, duration },
                results: [],
                status: "failed",
                error: error.message
            });
        }

        return responseHandler(res, 500, "Failed to start video generation", { error: error.message });
    }
});

// Check video generation status
export const checkVideoStatus = asyncHandler(async (req: Request, res: Response) => {
    // Maintenance Mode
    return responseHandler(res, 503, "System is under maintenance. AI generation is temporarily disabled.");

    const { jobId } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).user?._id;

    try {
        const result = await aiVideoService.checkStatus(jobId);

        // If video is successful, save to Assets if it doesn't already exist
        if (result.status === 'succeeded' && result.videoUrl && userId) {
            // Check if already saved (deduplication)
            const existingAsset = await AssetModel.findOne({ url: result.videoUrl });

            if (!existingAsset) {
                const asset = await AssetModel.create({
                    name: `Video Generation ${jobId}`, // We might want to pass the prompt here, but checkStatus doesn't natively return it unless we mock/store it. Using generic name for now.
                    type: "video",
                    url: result.videoUrl,
                    thumbnailUrl: result.thumbnailUrl || result.videoUrl,
                    userId: new mongoose.Types.ObjectId(userId),
                    metadata: {
                        format: "mp4"
                    },
                    tags: ["ai-video", "generated"]
                });

                // Update generation history with completed video
                await GenerationHistoryModel.findOneAndUpdate(
                    {
                        userId: new mongoose.Types.ObjectId(userId),
                        "results.jobId": jobId
                    },
                    {
                        $set: {
                            status: "completed",
                            "results.$.url": result.videoUrl,
                            "results.$.thumbnailUrl": result.thumbnailUrl,
                            "results.$.assetId": asset._id,
                            "results.$.status": "succeeded"
                        }
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
    const { imageUrl, prompt } = req.body;

    if (!imageUrl) {
        return responseHandler(res, 400, "Image URL is required");
    }

    try {
        let finalPrompt = prompt;

        if (prompt) {
            // Systematic Flow Step 1: Analyze Intent
            const intentAnalysis = await intentService.analyzeIntent(prompt, "video");

            // Systematic Flow Step 2: Intent-based Enhancement
            finalPrompt = await intentService.getSystematicPrompt(prompt, intentAnalysis);
        }

        const result = await aiVideoService.animateImage(imageUrl, finalPrompt);

        return responseHandler(res, 200, "Scene animation started", {
            jobId: result.jobId,
            status: result.status,
            thumbnailUrl: result.thumbnailUrl
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
