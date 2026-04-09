const env = require('../src/config/env');

async function run() {
    const url = `http://127.0.0.1:${env.port}/api/health`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.ok) {
            throw new Error(`Smoke test failed. Status: ${response.status}`);
        }

        console.log('Smoke test OK:', data);
        process.exit(0);
    } catch (error) {
        console.error('Smoke test error:', error.message);
        process.exit(1);
    }
}

run();
