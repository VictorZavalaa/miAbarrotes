const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

async function ensureSupplierVisitsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS supplier_visits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            supplier_id INT NOT NULL,
            visit_date DATE NOT NULL,
            expected_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            status ENUM('PENDING', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
            notes VARCHAR(255),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_supplier_visits_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
            INDEX idx_supplier_visits_date (visit_date),
            INDEX idx_supplier_visits_supplier (supplier_id)
        ) ENGINE=InnoDB
    `);
}

function toDateOnly(value) {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return null;

    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

router.get(
    '/',
    asyncHandler(async (req, res) => {
        await ensureSupplierVisitsTable();

        const from = toDateOnly(req.query.from);
        const to = toDateOnly(req.query.to);

        const where = [];
        const params = [];

        if (from) {
            where.push('sv.visit_date >= ?');
            params.push(from);
        }

        if (to) {
            where.push('sv.visit_date <= ?');
            params.push(to);
        }

        const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `SELECT
                sv.id,
                sv.supplier_id,
                s.name AS supplier_name,
                DATE_FORMAT(sv.visit_date, '%Y-%m-%d') AS visit_date,
                sv.expected_amount,
                sv.status,
                sv.notes,
                sv.created_at,
                sv.updated_at
             FROM supplier_visits sv
             INNER JOIN suppliers s ON s.id = sv.supplier_id
             ${whereSql}
             ORDER BY sv.visit_date ASC, s.name ASC`,
            params
        );

        res.json({ ok: true, data: rows });
    })
);

router.post(
    '/',
    asyncHandler(async (req, res) => {
        await ensureSupplierVisitsTable();

        const {
            supplier_id,
            visit_date,
            expected_amount = 0,
            status = 'PENDING',
            notes = null
        } = req.body;

        const supplierId = Number(supplier_id);
        const amount = Number(expected_amount);
        const dateOnly = toDateOnly(visit_date);
        const safeStatus = ['PENDING', 'PAID', 'CANCELLED'].includes(status) ? status : 'PENDING';

        if (!Number.isInteger(supplierId) || !dateOnly || Number.isNaN(amount) || amount < 0) {
            const error = new Error('supplier_id, visit_date y expected_amount válidos son obligatorios');
            error.statusCode = 400;
            throw error;
        }

        const [result] = await pool.query(
            `INSERT INTO supplier_visits (supplier_id, visit_date, expected_amount, status, notes)
             VALUES (?, ?, ?, ?, ?)`,
            [supplierId, dateOnly, amount, safeStatus, notes]
        );

        res.status(201).json({ ok: true, id: result.insertId });
    })
);

router.put(
    '/:id',
    asyncHandler(async (req, res) => {
        await ensureSupplierVisitsTable();

        const visitId = Number(req.params.id);
        if (!Number.isInteger(visitId)) {
            const error = new Error('id inválido');
            error.statusCode = 400;
            throw error;
        }

        const {
            supplier_id,
            visit_date,
            expected_amount,
            status,
            notes
        } = req.body;

        const updates = [];
        const params = [];

        if (supplier_id !== undefined) {
            const supplierId = Number(supplier_id);
            if (!Number.isInteger(supplierId)) {
                const error = new Error('supplier_id inválido');
                error.statusCode = 400;
                throw error;
            }
            updates.push('supplier_id = ?');
            params.push(supplierId);
        }

        if (visit_date !== undefined) {
            const dateOnly = toDateOnly(visit_date);
            if (!dateOnly) {
                const error = new Error('visit_date inválida');
                error.statusCode = 400;
                throw error;
            }
            updates.push('visit_date = ?');
            params.push(dateOnly);
        }

        if (expected_amount !== undefined) {
            const amount = Number(expected_amount);
            if (Number.isNaN(amount) || amount < 0) {
                const error = new Error('expected_amount inválido');
                error.statusCode = 400;
                throw error;
            }
            updates.push('expected_amount = ?');
            params.push(amount);
        }

        if (status !== undefined) {
            if (!['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
                const error = new Error('status inválido');
                error.statusCode = 400;
                throw error;
            }
            updates.push('status = ?');
            params.push(status);
        }

        if (notes !== undefined) {
            updates.push('notes = ?');
            params.push(notes || null);
        }

        if (updates.length === 0) {
            const error = new Error('No hay campos para actualizar');
            error.statusCode = 400;
            throw error;
        }

        params.push(visitId);

        const [result] = await pool.query(
            `UPDATE supplier_visits
             SET ${updates.join(', ')}
             WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            const error = new Error('Visita no encontrada');
            error.statusCode = 404;
            throw error;
        }

        res.json({ ok: true, affectedRows: result.affectedRows });
    })
);

router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        await ensureSupplierVisitsTable();

        const visitId = Number(req.params.id);
        if (!Number.isInteger(visitId)) {
            const error = new Error('id inválido');
            error.statusCode = 400;
            throw error;
        }

        const [result] = await pool.query('DELETE FROM supplier_visits WHERE id = ?', [visitId]);

        if (result.affectedRows === 0) {
            const error = new Error('Visita no encontrada');
            error.statusCode = 404;
            throw error;
        }

        res.json({ ok: true, affectedRows: result.affectedRows });
    })
);

module.exports = router;
