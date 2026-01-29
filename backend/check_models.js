
const axios = require('axios');

async function testGen() {
    const apiKey = "key_cbd89b94c87bd69486c9226f36770daeceb074872e76d1d99a00509837260ae32865d62ca04243fc970c5f638e29e32bccfd33745fa303a122b6a37510f1dd96";
    const devUrl = "https://api.dev.runwayml.com/v1";

    console.log("Testing Gen with gen3a_turbo...");
    try {
        const response = await axios.post(`${devUrl}/text_to_video`, {
            promptText: "a red cat",
            model: "veo3.1",
            duration: 5,
            ratio: "1280:720"
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "X-Runway-Version": "2024-11-06",
                "Content-Type": "application/json"
            }
        });
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Failed:", error.response?.status, JSON.stringify(error.response?.data, null, 2) || error.message);
    }
}

testGen();
