/**
 * Comprehensive Runway ML API Test Script
 * Run with: npx ts-node test-runway-variants.ts
 */

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = (process.env.RUNWAYML_API_KEY || "").trim();
const BASE_URL = "https://api.dev.runwayml.com/v1";

console.log("=== Runway ML API Configuration Tester ===");
console.log(`Using API Key: ${API_KEY.substring(0, 10)}... (Length: ${API_KEY.length})`);

async function testVariant(name: string, endpoint: string, payload: any) {
    console.log(`\nTesting [${name}]...`);
    console.log(`Endpoint: ${BASE_URL}${endpoint}`);
    console.log(`Payload:`, JSON.stringify(payload));

    try {
        const response = await axios.post(
            `${BASE_URL}${endpoint}`,
            payload,
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "X-Runway-Version": "2024-11-06",
                    "Content-Type": "application/json"
                },
                timeout: 10000
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
    if (!API_KEY) {
        console.error("❌ No API Key found in .env");
        return;
    }

    // Variant 1: Current Service Implementation
    await testVariant(
        "Current Service Config (text_to_image + promptText)",
        "/text_to_image",
        {
            promptText: "A simple test image",
            model: "gen4_image_turbo",
            ratio: "1024:1024"
        }
    );

    // Variant 2: 'prompt' instead of 'promptText'
    await testVariant(
        "Variant 2 (text_to_image + prompt)",
        "/text_to_image",
        {
            prompt: "A simple test image",
            model: "gen4_image_turbo",
            ratio: "1024:1024"
        }
    );

    // Variant 3: Original Endpoint (image_generation)
    await testVariant(
        "Variant 3 (image_generation + promptText)",
        "/image_generation",
        {
            promptText: "A simple test image",
            model: "gen4_image_turbo",
            width: 1024,
            height: 1024
        }
    );
}

runTests();
