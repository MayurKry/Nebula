
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load env before imports
dotenv.config({ path: path.join(__dirname, '../.env') });

// Mock logger to avoid import issues
const logger = {
    info: console.log,
    warn: console.warn,
    error: console.error
};

// Mock the logger import in services if needed (via module alias or just relying on these specific files not using global logger heavily or assuming they use the one we can't easily mock without full app boot)
// Actually, let's just try importing the service.
// NOTE: We need to connect to DB if the service uses it, but ai-image.service.ts likely doesn't use DB directly.

import { aiImageService } from '../src/services/ai-image.service';

async function testVideoStatus() {
    console.log("Testing AI Image Generation...");
    try {
        const result = await aiImageService.generateImage({
            prompt: "A futuristic city with flying cars, neon lights, cyberpunk style",
            width: 1024,
            height: 1024
        });
        console.log("Image Generation Success:", result);
    } catch (error: any) {
        console.error("Image Generation Failed:", error.message);
    }
}

testVideoStatus();
