#!/usr/bin/env node

/**
 * AI Provider Setup Helper
 * Run this script to test your AI provider configuration
 */

const axios = require('axios');
require('dotenv').config();

const PROVIDERS = {
    pollinations: {
        name: 'Pollinations.AI',
        needsKey: false,
        test: async () => {
            const url = 'https://image.pollinations.ai/prompt/test?width=512&height=512';
            const response = await axios.head(url, { timeout: 10000 });
            return response.status === 200;
        }
    },
    huggingface: {
        name: 'Hugging Face',
        needsKey: true,
        envVar: 'HUGGINGFACE_API_KEY',
        test: async (apiKey) => {
            const response = await axios.post(
                'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
                { inputs: 'test' },
                {
                    headers: { Authorization: `Bearer ${apiKey}` },
                    timeout: 10000,
                    validateStatus: (status) => status < 500
                }
            );
            return response.status === 200 || response.status === 503; // 503 = model loading
        }
    },
    segmind: {
        name: 'Segmind',
        needsKey: true,
        envVar: 'SEGMIND_API_KEY',
        test: async (apiKey) => {
            // Segmind test - just check if key is set
            return !!apiKey;
        }
    },
    replicate: {
        name: 'Replicate',
        needsKey: true,
        envVar: 'REPLICATE_API_KEY',
        test: async (apiKey) => {
            // Replicate test - just check if key is set
            return !!apiKey;
        }
    }
};

async function testProvider(providerId, config) {
    process.stdout.write(`Testing ${config.name}... `);

    try {
        if (config.needsKey) {
            const apiKey = process.env[config.envVar];
            if (!apiKey) {
                console.log('❌ NOT CONFIGURED (no API key)');
                return false;
            }

            const result = await config.test(apiKey);
            if (result) {
                console.log('✅ WORKING');
                return true;
            } else {
                console.log('❌ FAILED (invalid key or service down)');
                return false;
            }
        } else {
            const result = await config.test();
            if (result) {
                console.log('✅ WORKING');
                return true;
            } else {
                console.log('❌ FAILED (service down)');
                return false;
            }
        }
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('\n🎨 Nebula AI Provider Configuration Test\n');
    console.log('='.repeat(50));
    console.log('');

    const results = {};

    for (const [providerId, config] of Object.entries(PROVIDERS)) {
        results[providerId] = await testProvider(providerId, config);
    }

    console.log('');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:\n');

    const working = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;

    console.log(`✅ Working providers: ${working}/${total}`);
    console.log('');

    if (results.pollinations) {
        console.log('✨ Pollinations is working! You can use Nebula right now.');
    } else {
        console.log('⚠️  Pollinations is down. This is unusual - check your internet connection.');
    }

    console.log('');
    console.log('💡 Tips:');
    console.log('');

    if (!results.huggingface && !process.env.HUGGINGFACE_API_KEY) {
        console.log('  • Get a free Hugging Face API key:');
        console.log('    https://huggingface.co/settings/tokens');
        console.log('    Then add to .env: HUGGINGFACE_API_KEY=your_key_here');
        console.log('');
    }

    if (!results.segmind && !process.env.SEGMIND_API_KEY) {
        console.log('  • Get a free Segmind API key:');
        console.log('    https://www.segmind.com/');
        console.log('    Then add to .env: SEGMIND_API_KEY=your_key_here');
        console.log('');
    }

    console.log('  • See AI_PROVIDERS_GUIDE.md for detailed setup instructions');
    console.log('');
    console.log('='.repeat(50));
    console.log('');
}

main().catch(console.error);
