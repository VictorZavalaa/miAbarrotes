const express = require('express');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
    '/',
    asyncHandler(async (_req, res) => {
        await db.pingDatabase();

        res.json({
            ok: true,
            service: 'mi-tienda-backend',
            db: 'connected',
            timestamp: new Date().toISOString()
        });
    })
);

module.exports = router;
