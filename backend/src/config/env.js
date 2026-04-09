const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const env = {
    port: Number(process.env.PORT || 3000),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    db: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'TiendaDB',
        connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10)
    },
    mediaRoot: process.env.MEDIA_ROOT || path.resolve(__dirname, '../../media')
};

module.exports = env;
