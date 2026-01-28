/**
 * Quick test script to verify Runway ML API key
 * Run with: npx ts-node test-runway-key.ts
 */

import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testRunwayKey() {
    const apiKey = (process.env.RUNWAYML_API_KEY || "").trim();

    console.log("=== Runway ML API Key Test ===");
    console.log(`API Key length: ${apiKey.length}`);
    console.log(`API Key starts with: ${apiKey.substring(0, 15)}...`);
    console.log(`API Key ends with: ...${apiKey.substring(apiKey.length - 10)}`);
    console.log("");

    if (!apiKey) {
        console.error("❌ No API key found in environment!");
        return;
    }

    console.log("Testing API connection...");

    try {
        const response = await axios.post(
            "https://api.dev.runwayml.com/v1/text_to_image",
            {
                promptText: "a simple test image",
                model: "gen4_image_turbo",
                ratio: "1024:1024"
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "X-Runway-Version": "2024-11-06",
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        console.log("✅ API Key is VALID!");
        console.log("Response status:", response.status);
        console.log("Task ID:", response.data.id);
        console.log("");
        console.log("Full response:", JSON.stringify(response.data, null, 2));

    } catch (error: any) {
        console.error("❌ API Key test FAILED!");
        console.error("Status:", error.response?.status);
        console.error("Error:", error.response?.data || error.message);

        if (error.response?.status === 401) {
            console.error("\n⚠️  This indicates the API key is INVALID or EXPIRED");
            console.error("Please check with your manager for a new key.");
        } else if (error.response?.status === 429) {
            console.error("\n⚠️  Rate limit or credits exhausted");
        } else if (error.response?.status === 400) {
            console.error("\n⚠️  Bad request - check parameters");
        }
    }
}

testRunwayKey();
