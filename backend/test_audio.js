
const axios = require('axios');

async function testAudioFinal() {
    const apiKey = "key_cbd89b94c87bd69486c9226f36770daeceb074872e76d1d99a00509837260ae32865d62ca04243fc970c5f638e29e32bccfd33745fa303a122b6a37510f1dd96";
    const devUrl = "https://api.dev.runwayml.com/v1";

    console.log("Testing text_to_speech with eleven_multilingual_v2...");
    try {
        const response = await axios.post(`${devUrl}/text_to_speech`, {
            promptText: "Hello, this is a test of Runway ML text to speech.",
            model: "eleven_multilingual_v2",
            voice: {
                type: "predefined",
                id: "cgSgspJ2msm6clMCkdW9"
            }
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "X-Runway-Version": "2024-11-06",
                "Content-Type": "application/json"
            }
        });
        console.log("Success:", response.data);
    } catch (error) {
        console.log("Failed:", error.response?.status, JSON.stringify(error.response?.data, null, 2));
    }
}

testAudioFinal();
