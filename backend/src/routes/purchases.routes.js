const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { supplier_id, user_id = null, invoice_number = null, items } = req.body;

        if (!Number.isInteger(Number(supplier_id))) {
            const error = new Error('supplier_id es obligatorio y debe ser entero');
            error.statusCode = 400;
            throw error;
        }

        if (!Array.isArray(items) || items.length === 0) {
            const error = new Error('items debe tener al menos un producto');
            error.statusCode = 400;
            throw error;
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            let total = 0;
            const preparedItems = [];

            for (const item of items) {
                const productId = Number(item.product_id);
                const quantity = Number(item.quantity);
                const unitCost = Number(item.unit_cost);

                if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0 || Number.isNaN(unitCost) || unitCost <= 0) {
                    const error = new Error('Cada item debe incluir product_id, quantity y unit_cost válidos');
                    error.statusCode = 400;
                    throw error;
                }

                const subtotal = quantity * unitCost;
                total += subtotal;

                preparedItems.push({
                    product_id: productId,
                    quantity,
                    unit_cost: unitCost,
                    subtotal
                });
            }

            const [purchaseResult] = await connection.query(
                'INSERT INTO purchases (supplier_id, user_id, invoice_number, total) VALUES (?, ?, ?, ?)',
                [Number(supplier_id), user_id, invoice_number, total]
            );

            for (const item of preparedItems) {
                await connection.query(
                    'INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [purchaseResult.insertId, item.product_id, item.quantity, item.unit_cost, item.subtotal]
                );
            }

            await connection.commit();

            res.status(201).json({
                ok: true,
                purchase_id: purchaseResult.insertId,
                total,
                items: preparedItems
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    })
);

module.exports = router;
