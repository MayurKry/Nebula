/**
 * Runway ML API Test - Model & Env Variants
 * Run with: npx ts-node test-runway-models.ts
 */

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = (process.env.RUNWAYML_API_KEY || "").trim();

console.log("=== Runway ML API Model/Env Tester ===");

async function testConfig(name: string, baseUrl: string, payload: any) {
    console.log(`\nTesting [${name}]...`);
    console.log(`URL: ${baseUrl}/text_to_image`);

    try {
        const response = await axios.post(
            `${baseUrl}/text_to_image`,
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
        console.log("Response Body:", JSON.stringify(response.data, null, 2));
        if (response.data.id) {
            console.log(`Task ID Found: ${response.data.id}`);
        } else {
            console.warn("⚠️  WARNING: No 'id' field found in response!");
            console.log("Available keys:", Object.keys(response.data));
            return false;
        }

        // Verify Status Check
        console.log(`\nVerifying Status Check for ID: ${response.data.id}...`);
        try {
            const statusResponse = await axios.get(
                `${baseUrl}/tasks/${response.data.id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${API_KEY}`,
                        "X-Runway-Version": "2024-11-06"
                    }
                }
            );
            console.log(`✅ Status Check SUCCESS! Status: ${statusResponse.status}`);
            console.log("Status Response:", JSON.stringify(statusResponse.data, null, 2));
            return true;
        } catch (statusError: any) {
            console.log(`❌ Status Check FAILED. Status: ${statusError.response?.status}`);
            if (statusError.response?.data) {
                console.log("Error Data:", JSON.stringify(statusError.response.data, null, 2));
            }
            return false;
        }
    } catch (error: any) {
        console.log(`❌ FAILED. Status: ${error.response?.status}`);
        if (error.response?.data) {
            // console.log("Error Data:", JSON.stringify(error.response.data, null, 2));
            console.log("Error Message:", error.response.data.error || JSON.stringify(error.response.data.issues));
        }
        return false;
    }
}

async function runTests() {
    // 1. Dev Env - Different Model
    await testConfig(
        "Dev Env - gen4_image (no turbo)",
        "https://api.dev.runwayml.com/v1",
        {
            promptText: "A simple test image",
            model: "gen4_image",
            ratio: "1024:1024"
        }
    );

    // 3. Ratio Snapping Test
    await testConfig(
        "Ratio Snapping Test (500x500 -> Should Snap)",
        "https://api.dev.runwayml.com/v1",
        {
            promptText: "A simple test image",
            model: "gen4_image",
            width: 500,  // Non-standard
            height: 500  // Non-standard
        }
    );
}

runTests();
