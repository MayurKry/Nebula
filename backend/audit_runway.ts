import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function checkRunwayHistory() {
    const apiKey = process.env.RUNWAYML_API_KEY;
    if (!apiKey) {
        console.error("No API Key");
        return;
    }

    console.log("Fetching Runway tasks...");
    // Runway doesn't have a simple "list all tasks" endpoint documented in the standard accessible docs for just listing history without IDs?
    // Usually it is GET /v1/tasks?limit=50 or similar.
    // Let's try to query just one known ID if we have it, or guess. 
    // Actually, without a list endpoint, I can't audit.
    // But I can try the `test-runway-key` logic to see if I can just validate the key.

    // Instead, I will clean up the previous script logic.
    // If I can't list, I can't prove.
    // But I can explain the situation.

    // Let's try a standard list endpoint just in case it exists (common pattern)
    try {
        const res = await axios.get('https://api.dev.runwayml.com/v1/tasks', {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "X-Runway-Version": "2024-11-06"
            }
        });
        console.log("Tasks:", res.data);
    } catch (e: any) {
        console.log("List tasks failed (might not be supported):", e.response?.status, e.response?.data);
    }
}

checkRunwayHistory();
