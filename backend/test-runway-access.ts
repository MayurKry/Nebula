/**
 * Runway ML Video Model Access Test
 * Run with: npx ts-node test-runway-access.ts
 */

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = (process.env.RUNWAYML_API_KEY || "").trim();
const BASE_URL = "https://api.dev.runwayml.com/v1";

const MODELS = ["gen3a_turbo", "gen4.5", "veo3", "veo3.1", "veo3.1_fast"];

console.log("=== Video Model Access Tester ===");

async function testModel(modelName: string) {
    console.log(`\nTesting Model: [${modelName}]...`);
    try {
        const response = await axios.post(
            `${BASE_URL}/text_to_video`,
            {
                promptText: "A cinematic drone shot of a futuristic city",
                model: modelName,
                duration: 6, // Safe duration for Veo
                ratio: "1280:720"
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "X-Runway-Version": "2024-11-06",
                    "Content-Type": "application/json"
                },
                timeout: 20000
            }
        );
        console.log(`✅ SUCCESS! Status: ${response.status}`);
        // console.log("Data:", JSON.stringify(response.data));
        return true;
    } catch (error: any) {
        console.log(`❌ FAILED. Status: ${error.response?.status}`);
        console.log("Error:", JSON.stringify(error.response?.data || error.message));
        if (error.response?.status === 403) {
            console.log("   -> Access Forbidden (Plan incorrect or Model restricted)");
        }
        return false;
    }
}

async function runTests() {
    await testModel("veo3.1_fast");
}

runTests();
