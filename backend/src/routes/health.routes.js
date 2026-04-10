const express = require('express');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const DEPLOY_TAG = process.env.DEPLOY_TAG || 'release-check-2026-04-09';

router.get(
    '/',
    asyncHandler(async (_req, res) => {
        await db.pingDatabase();

        res.json({
            ok: true,
            service: 'mi-tienda-backend',
            db: 'connected',
            deploy_tag: DEPLOY_TAG,
            timestamp: new Date().toISOString()
        });
    })
);

module.exports = router;
