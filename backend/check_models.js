
const axios = require('axios');

async function testFastDurations() {
    const apiKey = "key_cbd89b94c87bd69486c9226f36770daeceb074872e76d1d99a00509837260ae32865d62ca04243fc970c5f638e29e32bccfd33745fa303a122b6a37510f1dd96";
    const devUrl = "https://api.dev.runwayml.com/v1";

    const durations = [4, 5, 6, 8, 10];

    for (const duration of durations) {
        console.log(`Testing veo3.1_fast with ${duration}s...`);
        try {
            await axios.post(`${devUrl}/text_to_video`, {
                promptText: "a running river",
                model: "veo3.1_fast",
                duration: duration,
                ratio: "1280:720"
            }, {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "X-Runway-Version": "2024-11-06",
                    "Content-Type": "application/json"
                }
            });
            console.log(`✅ veo3.1_fast supports ${duration}s`);
        } catch (error) {
            console.log(`❌ veo3.1_fast fails ${duration}s:`, error.response?.data?.issues?.[0]?.message || error.response?.data?.error || error.message);
        }
    }
}

testFastDurations();
