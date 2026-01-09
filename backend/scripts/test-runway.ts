
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { aiVideoService } from '../src/services/ai-video.service';

async function testRunway() {
    const key = process.env.RUNWAYML_API_KEY;
    console.log("Checking RunwayML API Key...");
    if (!key) {
        console.error("❌ ERROR: RUNWAYML_API_KEY is missing in .env file");
        process.exit(1);
    }
    console.log(`✅ Key found: ${key.substring(0, 8)}...`);

    console.log("Starting RunwayML Video Generation Test...");
    try {
        const result = await aiVideoService.generateVideo({
            prompt: "A futuristic city with flying cars, cinematic lighting, 4k",
            duration: 5
        });

        console.log("Generation started:", result);

        if (result.status === 'processing') {
            console.log(`Polling for status (Job ID: ${result.jobId})...`);

            // Poll for a bit
            for (let i = 0; i < 30; i++) {
                await new Promise(r => setTimeout(r, 2000));
                // We need to access checkStatus. Since it's private in the service, we can't call it directly easily in this script without modifying the service or using 'any'.
                // However, I can't easily change the visibility just for this test without modifying the file again.
                // Wait, I can use 'any' cast.
                const status = await (aiVideoService as any).checkStatus(result.jobId);
                console.log(`Attempt ${i + 1}: Status = ${status.status}`);

                if (status.status === 'succeeded') {
                    console.log("✅ SUCCESS! Video URL:", status.videoUrl);
                    break;
                } else if (status.status === 'failed') {
                    console.error("❌ FAILED:", status.error);
                    break;
                }
            }
        }
    } catch (error: any) {
        console.error("❌ Test Failed:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
    }
}

testRunway();
