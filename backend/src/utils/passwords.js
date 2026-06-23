const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const HASH_PREFIX = 'scrypt';
const KEY_LENGTH = 64;

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await scrypt(String(password), salt, KEY_LENGTH);
    return `${HASH_PREFIX}$${salt}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedValue) {
    const stored = String(storedValue || '');

    if (!stored.startsWith(`${HASH_PREFIX}$`)) {
        return {
            valid: stored === String(password),
            needsUpgrade: stored === String(password)
        };
    }

    const [, salt, hashHex] = stored.split('$');
    if (!salt || !hashHex) {
        return { valid: false, needsUpgrade: false };
    }

    const expected = Buffer.from(hashHex, 'hex');
    const actual = await scrypt(String(password), salt, expected.length);
    const valid =
        expected.length === actual.length &&
        crypto.timingSafeEqual(expected, actual);

    return { valid, needsUpgrade: false };
}

module.exports = {
    hashPassword,
    verifyPassword
};
