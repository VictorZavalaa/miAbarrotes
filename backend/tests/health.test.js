const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const db = require('../src/config/db');

test('GET /api/health responde OK (con DB mock)', async () => {
    const originalPing = db.pingDatabase;
    db.pingDatabase = async () => { };

    const response = await request(app).get('/api/health');

    assert.equal(response.status, 200);
    assert.equal(response.body.ok, true);
    assert.equal(response.body.service, 'mi-tienda-backend');

    db.pingDatabase = originalPing;
});
