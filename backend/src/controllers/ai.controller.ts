import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { responseHandler } from "../utils/responseHandler";
import { aiImageService } from "../services/ai-image.service";

// AI Image Generation with multiple providers
export const generateImage = asyncHandler(async (req: Request, res: Response) => {
    const { prompt, style, width = 1024, height = 1024, seed, negativePrompt, count = 2 } = req.body;

    if (!prompt) {
        return responseHandler(res, 400, "Prompt is required");
    }

    try {
        // Generate multiple images using AI service (with automatic fallback)
        const imageCount = Math.min(Math.max(1, count), 4); // Limit between 1-4 images

        // Generate images with different seeds to ensure variety
        const promises = Array.from({ length: imageCount }, (_, index) => {
            // Use provided seed or generate random seed, but make each image different
            const imageSeed = seed ? seed + index : Math.floor(Math.random() * 1000000) + index;

            return aiImageService.generateImage({
                prompt,
                style,
                width,
                height,
                seed: imageSeed,
                negativePrompt,
            });
        });

        const results = await Promise.all(promises);

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

// Mock AI Video Generation
export const generateVideo = asyncHandler(async (req: Request, res: Response) => {
    const { prompt, style, duration = 5 } = req.body;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Return mock generated video data
    return responseHandler(res, 200, "Video generation started", {
        jobId: `job_${Date.now()}`,
        prompt,
        style,
        duration,
        status: "processing",
        estimatedTime: duration * 10, // 10 seconds per video second
        thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/640/360`,
    });
});

// Check video generation status
export const checkVideoStatus = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;

    // Mock status - randomly complete or still processing
    const isComplete = Math.random() > 0.3;

    if (isComplete) {
        return responseHandler(res, 200, "Video generation complete", {
            jobId,
            status: "completed",
            videoUrl: `https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4`,
            thumbnailUrl: `https://picsum.photos/seed/${jobId}/640/360`,
        });
    }

    return responseHandler(res, 200, "Video still processing", {
        jobId,
        status: "processing",
        progress: Math.floor(Math.random() * 80) + 10,
    });
});

// Generate Full Video Project (Script -> Storyboard -> Video)
export const generateVideoProject = asyncHandler(async (req: Request, res: Response) => {
    const { prompt, style, duration = 30 } = req.body;

    // Use Gemini to generate the project structure
    try {
        const systemSystem = `You are an expert film director and AI video architect. 
        Create a structured video project plan based on the user's prompt. 
        Target Duration: ${duration} seconds. Style: ${style}.
        
        Output valid JSON only. NO MARKDOWN. Structure:
        {
          "script": "string (The full screenplay text)",
          "language": "string (e.g. English)",
          "region": "string (e.g. US)",
          "characters": [
            { "id": "char_1", "name": "string", "bio": "string", "accent": "string", "voiceId": "string" }
          ],
          "scenes": [
            { 
               "id": "scene_1", "order": 0, "description": "string (visual prompt for image generation)", 
               "duration": number (seconds), "cameraPath": "string (Static, Pan, Zoom, Orbit)", 
               "motionIntensity": number (1-100), "assignedCharacterId": "string (optional)" 
            }
          ]
        }
        Ensure scene durations sum to approx ${duration}. Create approx ${Math.max(3, Math.floor(duration / 5))} scenes.
        `;

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

        // Process scenes in parallel (limit to 4 to avoid hitting rate limits too hard/timeouts)
        const scenePromises = generatedData.scenes.slice(0, 6).map(async (scene: any, index: number) => {
            try {
                // Generate clear visual description
                const visualPrompt = `${style} style. ${scene.description}. High quality, cinematic lighting, 4k.`;

                const imageResult = await aiImageService.generateImage({
                    prompt: visualPrompt,
                    width: 1280,
                    height: 720,
                    style: style
                });

                return {
                    ...scene,
                    id: scene.id || `scene_${index + 1}`,
                    order: index,
                    imageUrl: imageResult.url,
                    type: 'video',
                    cameraPath: scene.cameraPath || "Static",
                    motionIntensity: scene.motionIntensity || 50
                };
            } catch (err) {
                console.error(`Failed to generate image for scene ${index}:`, err);
                // Fallback image if generation fails
                return {
                    ...scene,
                    id: scene.id || `scene_${index + 1}`,
                    order: index,
                    imageUrl: `https://placehold.co/1280x720/1a1a1a/FFF?text=${encodeURIComponent(scene.description.slice(0, 20))}`,
                    type: 'video',
                    cameraPath: scene.cameraPath || "Static",
                    motionIntensity: scene.motionIntensity || 50
                };
            }
        });

        const scenes = await Promise.all(scenePromises);

        // Process remaining scenes with placeholders if any (to avoid timeouts)
        if (generatedData.scenes.length > 6) {
            generatedData.scenes.slice(6).forEach((scene: any, index: number) => {
                scenes.push({
                    ...scene,
                    id: scene.id || `scene_${index + 7}`,
                    order: index + 6,
                    imageUrl: `https://placehold.co/1280x720/1a1a1a/FFF?text=${encodeURIComponent(scene.description.slice(0, 20))}`,
                    type: 'video',
                    cameraPath: scene.cameraPath || "Static",
                    motionIntensity: scene.motionIntensity || 50
                });
            });
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

        return responseHandler(res, 200, "Project generated successfully", {
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
        });

    } catch (error: any) {
        console.error("Gemini Project Generation Failed:", error);

        // Fallback to Safe Mock if Gemini fails (Critical for Prototype Stability)
        // This ensures the user ALWAYS sees a result, even if API quotas are hit or network fails.
        console.log("⚠️ Falling back to Mock Project Generation to save the demo...");

        const mockScenes = Array.from({ length: 5 }, (_, i) => ({
            id: `mock_scene_${i}`,
            order: i,
            description: `[Mock] Scene ${i + 1} - Visual representation of ${prompt}`,
            duration: 5,
            imageUrl: `https://picsum.photos/seed/mock_${Date.now()}_${i}/1280/720`,
            type: 'video',
            cameraPath: "Static",
            motionIntensity: 50
        }));

        const mockTracks = [
            {
                id: "track_music_1",
                type: "music",
                name: "Cinematic Score (Mock)",
                startTime: 0,
                duration: duration,
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                volume: 0.5
            }
        ];

        return responseHandler(res, 200, "Project generated (Fallback Mode)", {
            projectId: `proj_mock_${Date.now()}`,
            prompt: prompt,
            settings: {
                style,
                duration,
                language: "English",
                region: "US",
                aspectRatio: "16:9"
            },
            script: "This is a fallback script generated because the AI service is currently unavailable. Your scene will be awesome!",
            scenes: mockScenes,
            characters: [],
            tracks: mockTracks,
            createdAt: new Date().toISOString(),
        });
    }
});


// Mock Storyboard Generation
export const generateStoryboard = asyncHandler(async (req: Request, res: Response) => {
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

    return responseHandler(res, 200, "Onboarding completed", user);
});
