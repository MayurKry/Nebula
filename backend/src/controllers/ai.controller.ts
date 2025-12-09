import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { responseHandler } from "../utils/responseHandler";

// Mock AI Image Generation
export const generateImage = asyncHandler(async (req: Request, res: Response) => {
    const { prompt, style, width = 1024, height = 1024 } = req.body;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return mock generated image URL (using placeholder)
    const mockImageUrl = `https://picsum.photos/seed/${Date.now()}/${width}/${height}`;

    return responseHandler(res, 200, "Image generated successfully", {
        url: mockImageUrl,
        prompt,
        style,
        width,
        height,
        generatedAt: new Date().toISOString(),
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
