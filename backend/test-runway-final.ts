/**
 * Comprehensive Runway ML API Test Script (Fixed)
 * Run with: npx ts-node test-runway-final.ts
 */

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = (process.env.RUNWAYML_API_KEY || "").trim();
const BASE_URL = "https://api.dev.runwayml.com/v1";

console.log("=== Runway ML API Final Test ===");

async function testFinal() {
    try {
        const response = await axios.post(
            `${BASE_URL}/text_to_image`,
            {
                promptText: "A simple test image",
                model: "gen4_image_turbo",
                ratio: "1024:1024",
                referenceImages: [] // This seems to be the missing parameter!
            },
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
    } catch (error: any) {
        console.log(`❌ FAILED. Status: ${error.response?.status}`);
        if (error.response?.data) {
            console.log("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log("Error Message:", error.message);
        }
    }
}

testFinal();
