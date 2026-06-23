const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword, verifyPassword } = require('../utils/passwords');

const router = express.Router();

async function ensureUsersSchema() {
    await pool.query(
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(80) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL DEFAULT '',
            role VARCHAR(20) NOT NULL DEFAULT 'CAJERO',
            is_admin TINYINT(1) NOT NULL DEFAULT 0,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB`
    );

    try {
        await pool.query('ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0');
    } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') throw error;
    }

    try {
        await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'CAJERO'");
    } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') throw error;
    }

    await pool.query(
        `UPDATE users
         SET is_admin = CASE
            WHEN UPPER(COALESCE(role, '')) = 'ADMIN' THEN 1
            ELSE COALESCE(is_admin, 0)
         END`
    );

    await pool.query(
        `INSERT IGNORE INTO users (username, password_hash, role, is_admin, is_active)
         VALUES ('admin', 'admin123', 'ADMIN', 1, 1)`
    );

    await pool.query(
        `UPDATE users
         SET password_hash = 'admin123'
         WHERE username = 'admin' AND (password_hash IS NULL OR TRIM(password_hash) = '')`
    );
}

router.post(
    '/',
    asyncHandler(async (req, res) => {
        await ensureUsersSchema();

        const username = String(req.body?.username || '').trim();
        const password = String(req.body?.password || '');
        if (!username || !password) {
            const error = new Error('username y password son obligatorios');
            error.statusCode = 400;
            throw error;
        }

        const [rows] = await pool.query(
            `SELECT
                id,
                username,
                password_hash,
                CASE
                    WHEN is_admin IS NOT NULL THEN is_admin
                    WHEN UPPER(COALESCE(role, '')) = 'ADMIN' THEN 1
                    ELSE 0
                END AS is_admin,
                CASE
                    WHEN UPPER(COALESCE(role, '')) = 'ADMIN' THEN 'ADMIN'
                    ELSE 'CAJERO'
                END AS role,
                is_active
             FROM users
             WHERE username = ?
             LIMIT 1`,
            [username]
        );

        const user = rows[0];
        if (!user || Number(user.is_active || 0) !== 1) {
            const error = new Error('Usuario no encontrado o inactivo');
            error.statusCode = 404;
            throw error;
        }

        const passwordCheck = await verifyPassword(password, user.password_hash);
        if (!passwordCheck.valid) {
            const error = new Error('Contraseña incorrecta');
            error.statusCode = 401;
            throw error;
        }

        if (passwordCheck.needsUpgrade) {
            const upgradedHash = await hashPassword(password);
            await pool.query(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [upgradedHash, user.id]
            );
        }

        const { password_hash: _passwordHash, ...safeUser } = user;

        res.json({ ok: true, data: safeUser });
    })
);

router.put(
    '/password',
    asyncHandler(async (req, res) => {
        await ensureUsersSchema();

        const userId = Number(req.body?.user_id);
        const currentPassword = String(req.body?.current_password || '');
        const newPassword = String(req.body?.new_password || '');

        if (!Number.isInteger(userId) || userId <= 0 || !currentPassword || !newPassword) {
            const error = new Error('Usuario, contraseña actual y contraseña nueva son obligatorios');
            error.statusCode = 400;
            throw error;
        }

        if (newPassword.length < 8) {
            const error = new Error('La contraseña nueva debe tener al menos 8 caracteres');
            error.statusCode = 400;
            throw error;
        }

        if (currentPassword === newPassword) {
            const error = new Error('La contraseña nueva debe ser diferente a la actual');
            error.statusCode = 400;
            throw error;
        }

        const [rows] = await pool.query(
            `SELECT id, password_hash, is_active
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [userId]
        );

        const user = rows[0];
        if (!user || Number(user.is_active || 0) !== 1) {
            const error = new Error('Usuario no encontrado o inactivo');
            error.statusCode = 404;
            throw error;
        }

        const passwordCheck = await verifyPassword(currentPassword, user.password_hash);
        if (!passwordCheck.valid) {
            const error = new Error('La contraseña actual es incorrecta');
            error.statusCode = 401;
            throw error;
        }

        const passwordHash = await hashPassword(newPassword);
        await pool.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [passwordHash, userId]
        );

        res.json({
            ok: true,
            message: 'Contraseña actualizada correctamente'
        });
    })
);

module.exports = router;
