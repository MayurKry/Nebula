/**
 * Runway ML Video Generation Test
 * Run with: npx ts-node test-runway-video.ts
 */

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = (process.env.RUNWAYML_API_KEY || "").trim();
const BASE_URL = "https://api.dev.runwayml.com/v1";

console.log("=== Runway ML Video Test ===");

async function testVideo(name: string, payload: any) {
    console.log(`\nTesting [${name}]...`);
    try {
        const response = await axios.post(
            `${BASE_URL}/text_to_video`,
            payload,
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "X-Runway-Version": "2024-11-06",
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );
        console.log(`✅ SUCCESS! Status: ${response.status}`);
        console.log("Response:", JSON.stringify(response.data, null, 2));
        return true;
    } catch (error: any) {
        console.log(`❌ FAILED. Status: ${error.response?.status}`);
        if (error.response?.data) {
            console.log("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log("Error Message:", error.message);
        }
        return false;
    }
}

async function runTests() {
    // Test 1: Current Default Ratio (1280:768)
    await testVideo(
        "Current Default (gen4_turbo + 1280:768)",
        {
            promptText: "A cinematic drone shot of a futuristic city",
            model: "gen4_turbo",
            duration: 5,
            ratio: "1280:768"
        }
    );

    // Test 3: Gen3 Alpha Turbo (Valid Model)
    await testVideo(
        "Gen3 Alpha Turbo (gen3a_turbo + 1280:720)",
        {
            promptText: "A cinematic drone shot of a futuristic city",
            model: "gen3a_turbo",
            duration: 5,
            ratio: "1280:720"
        }
    );
}

runTests();
