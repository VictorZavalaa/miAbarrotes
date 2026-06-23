const test = require('node:test');
const assert = require('node:assert/strict');

const { parseAllowedOrigins, createCorsOptions } = require('../src/config/cors');

test('parseAllowedOrigins acepta una lista separada por comas', () => {
    assert.deepEqual(
        parseAllowedOrigins(
            'http://192.168.1.86, http://victor.tail9c69fc.ts.net'
        ),
        ['http://192.168.1.86', 'http://victor.tail9c69fc.ts.net']
    );
});

test('CORS permite los orígenes configurados', async () => {
    const options = createCorsOptions(
        'http://192.168.1.86,http://victor.tail9c69fc.ts.net'
    );

    await new Promise((resolve, reject) => {
        options.origin('http://victor.tail9c69fc.ts.net', (error, allowed) => {
            try {
                assert.ifError(error);
                assert.equal(allowed, true);
                resolve();
            } catch (assertionError) {
                reject(assertionError);
            }
        });
    });
});

test('CORS rechaza orígenes no configurados', async () => {
    const options = createCorsOptions('http://192.168.1.86');

    await new Promise((resolve, reject) => {
        options.origin('http://example.com', (error) => {
            try {
                assert.match(error.message, /Origen no permitido/);
                resolve();
            } catch (assertionError) {
                reject(assertionError);
            }
        });
    });
});
