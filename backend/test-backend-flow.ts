
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/v1';

async function testVideoFlow() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'mayur.thakkar@akinolabs.com',
            password: 'Password123!'
        });

        const token = loginRes.data.data.accessToken;
        console.log('Logged in. Token:', token.substring(0, 20) + '...');

        // 2. Generate Video
        console.log('Requesting Video Generation...');
        const res = await axios.post(`${BASE_URL}/ai/generate-video`, {
            prompt: "A cinematic drone shot of a futuristic city",
            style: "Cinematic",
            duration: 6
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Response:', res.status, res.data);

    } catch (error: any) {
        console.error('Error:', error.response?.status, error.response?.data);
    }
}

testVideoFlow();
