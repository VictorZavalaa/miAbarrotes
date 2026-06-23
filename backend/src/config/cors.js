function parseAllowedOrigins(value) {
    const origins = String(value || '*')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    return origins.length ? origins : ['*'];
}

function createCorsOptions(value) {
    const allowedOrigins = parseAllowedOrigins(value);

    if (allowedOrigins.includes('*')) {
        return { origin: true };
    }

    return {
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error(`Origen no permitido por CORS: ${origin}`));
        }
    };
}

module.exports = {
    parseAllowedOrigins,
    createCorsOptions
};
