const axios = require('axios');

async function testAudioFinal() {
    const apiKey = "key_cbd89b94c87bd69486c9226f36770daeceb074872e76d1d99a00509837260ae32865d62ca04243fc970c5f638e29e32bccfd33745fa303a122b6a37510f1dd96";
    const devUrl = "https://api.dev.runwayml.com/v1";

    console.log("Testing text_to_speech with Leslie and promptText...");
    try {
        const response = await axios.post(`${devUrl}/text_to_speech`, {
            model: "eleven_multilingual_v2",
            promptText: "The quick brown fox jumps over the lazy dog",
            voice: {
                type: "runway-preset",
                presetId: "Leslie"
            }
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "X-Runway-Version": "2024-11-06",
                "Content-Type": "application/json"
            }
        });
        console.log("Success:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log("Failed:", error.response?.status, JSON.stringify(error.response?.data, null, 2));
    }
}

testAudioFinal();
