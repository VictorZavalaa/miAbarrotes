const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const db = require('../src/config/db');

test('PUT /api/login/password valida la actual y guarda un hash', async () => {
    const originalQuery = db.pool.query;
    const updates = [];

    db.pool.query = async (sql, params = []) => {
        const normalizedSql = String(sql).replace(/\s+/g, ' ').trim();

        if (normalizedSql.startsWith('SELECT id, password_hash, is_active')) {
            return [[{ id: 1, password_hash: '12345678', is_active: 1 }]];
        }

        if (normalizedSql.startsWith('UPDATE users SET password_hash = ? WHERE id = ?')) {
            updates.push(params);
        }

        return [[], []];
    };

    try {
        const response = await request(app)
            .put('/api/login/password')
            .send({
                user_id: 1,
                current_password: '12345678',
                new_password: 'nueva-clave-2026'
            });

        assert.equal(response.status, 200);
        assert.equal(response.body.ok, true);
        assert.equal(updates.length, 1);
        assert.match(updates[0][0], /^scrypt\$/);
        assert.equal(updates[0][1], 1);
    } finally {
        db.pool.query = originalQuery;
    }
});
