const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const ALLOWED_VISIT_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const ALLOWED_VISIT_FREQUENCIES = ['WEEKLY', 'BIWEEKLY'];

function normalizeVisitDays(value) {
    const source = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? value.split(',')
            : [];

    const normalized = source
        .map((day) => String(day || '').trim().toUpperCase())
        .filter((day) => ALLOWED_VISIT_DAYS.includes(day));

    return Array.from(new Set(normalized));
}

function normalizeVisitFrequency(value) {
    const frequency = String(value || 'WEEKLY').trim().toUpperCase();
    return ALLOWED_VISIT_FREQUENCIES.includes(frequency) ? frequency : 'WEEKLY';
}

function parseVisitDays(rawValue) {
    if (!rawValue) return [];

    try {
        const parsed = JSON.parse(rawValue);
        return normalizeVisitDays(parsed);
    } catch {
        return normalizeVisitDays(rawValue);
    }
}

async function ensureSuppliersScheduleColumns() {
    await pool.query(`
        ALTER TABLE suppliers
        ADD COLUMN IF NOT EXISTS visit_days_json TEXT NULL AFTER notes,
        ADD COLUMN IF NOT EXISTS visit_frequency VARCHAR(20) NOT NULL DEFAULT 'WEEKLY' AFTER visit_days_json
    `);
}

router.get(
    '/',
    asyncHandler(async (_req, res) => {
        await ensureSuppliersScheduleColumns();

        const [rows] = await pool.query(
            `SELECT id, name, contact_name, phone, email, address, notes, is_active, visit_days_json, visit_frequency
       FROM suppliers
       ORDER BY name ASC`
        );

        const data = rows.map((row) => ({
            ...row,
            visit_days: parseVisitDays(row.visit_days_json),
            visit_frequency: normalizeVisitFrequency(row.visit_frequency)
        }));

        res.json({ ok: true, data });
    })
);

router.post(
    '/',
    asyncHandler(async (req, res) => {
        await ensureSuppliersScheduleColumns();

        const {
            name,
            contact_name = null,
            phone = null,
            email = null,
            address = null,
            notes = null,
            visit_days = [],
            visit_frequency = 'WEEKLY'
        } = req.body;

        if (!name) {
            const error = new Error('name es obligatorio');
            error.statusCode = 400;
            throw error;
        }

        const normalizedVisitDays = normalizeVisitDays(visit_days);
        const normalizedVisitFrequency = normalizeVisitFrequency(visit_frequency);

        const [result] = await pool.query(
            `INSERT INTO suppliers (name, contact_name, phone, email, address, notes, visit_days_json, visit_frequency)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                contact_name,
                phone,
                email,
                address,
                notes,
                JSON.stringify(normalizedVisitDays),
                normalizedVisitFrequency
            ]
        );

        res.status(201).json({ ok: true, id: result.insertId });
    })
);

router.post(
    '/:supplierId/products',
    asyncHandler(async (req, res) => {
        const supplierId = Number(req.params.supplierId);
        const { product_id, supplier_sku = null, last_cost = null, lead_time_days = null, is_preferred = 0 } = req.body;

        if (!Number.isInteger(supplierId) || !Number.isInteger(Number(product_id))) {
            const error = new Error('supplierId y product_id válidos son obligatorios');
            error.statusCode = 400;
            throw error;
        }

        const [result] = await pool.query(
            `INSERT INTO supplier_products
      (supplier_id, product_id, supplier_sku, last_cost, lead_time_days, is_preferred)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        supplier_sku = VALUES(supplier_sku),
        last_cost = VALUES(last_cost),
        lead_time_days = VALUES(lead_time_days),
        is_preferred = VALUES(is_preferred)`,
            [supplierId, Number(product_id), supplier_sku, last_cost, lead_time_days, Number(is_preferred) ? 1 : 0]
        );

        res.status(201).json({ ok: true, affectedRows: result.affectedRows });
    })
);

module.exports = router;
