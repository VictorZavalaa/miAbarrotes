const app = require('./app');
const env = require('./config/env');

const MAX_PORT_FALLBACK_ATTEMPTS = 20;

function startServer(initialPort, attemptsLeft = MAX_PORT_FALLBACK_ATTEMPTS) {
    const port = Number(initialPort) || 3000;
    const server = app.listen(port, () => {
        console.log(`Backend running on port ${port}`);
    });

    server.on('error', (error) => {
        if (error?.code === 'EADDRINUSE' && attemptsLeft > 0) {
            const nextPort = port + 1;
            console.warn(
                `Port ${port} is in use, retrying on ${nextPort} (${attemptsLeft} attempt(s) left)...`
            );
            startServer(nextPort, attemptsLeft - 1);
            return;
        }

        console.error('Failed to start backend server:', error);
        process.exit(1);
    });
}

startServer(env.port);
