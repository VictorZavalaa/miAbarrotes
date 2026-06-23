const test = require('node:test');
const assert = require('node:assert/strict');

const { hashPassword, verifyPassword } = require('../src/utils/passwords');

test('hashPassword genera un hash scrypt verificable', async () => {
    const password = 'una-clave-segura';
    const hash = await hashPassword(password);

    assert.match(hash, /^scrypt\$/);
    assert.notEqual(hash, password);
    assert.equal((await verifyPassword(password, hash)).valid, true);
    assert.equal((await verifyPassword('incorrecta', hash)).valid, false);
});

test('verifyPassword acepta claves legadas y solicita migración', async () => {
    assert.deepEqual(
        await verifyPassword('12345678', '12345678'),
        { valid: true, needsUpgrade: true }
    );
    assert.deepEqual(
        await verifyPassword('incorrecta', '12345678'),
        { valid: false, needsUpgrade: false }
    );
});
