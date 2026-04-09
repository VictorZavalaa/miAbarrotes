const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
    '/today-summary',
    asyncHandler(async (_req, res) => {
        const [rows] = await pool.query(
            `SELECT
                COALESCE(SUM(total), 0) AS total,
                COUNT(*) AS sales_count
             FROM sales
             WHERE status = 'COMPLETED'
               AND DATE(created_at) = CURDATE()`
        );

        const summary = rows[0] || { total: 0, sales_count: 0 };
        res.json({
            ok: true,
            data: {
                total: Number(summary.total || 0),
                sales_count: Number(summary.sales_count || 0)
            }
        });
    })
);

router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { items, payment_method = 'CASH', user_id = null } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            const error = new Error('items debe ser un arreglo con al menos un producto');
            error.statusCode = 400;
            throw error;
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            let total = 0;
            const preparedItems = [];

            for (const item of items) {
                const quantity = Number(item.quantity);
                const productId = Number(item.product_id);

                if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isInteger(productId)) {
                    const error = new Error('Cada item requiere product_id y quantity válidos');
                    error.statusCode = 400;
                    throw error;
                }

                const [rows] = await connection.query(
                    'SELECT id, name, sale_price, stock FROM products WHERE id = ? FOR UPDATE',
                    [productId]
                );

                if (rows.length === 0) {
                    const error = new Error(`Producto no encontrado: ${productId}`);
                    error.statusCode = 404;
                    throw error;
                }

                const product = rows[0];

                if (product.stock < quantity) {
                    const error = new Error(`Stock insuficiente para ${product.name}`);
                    error.statusCode = 400;
                    throw error;
                }

                const unitPrice = Number(product.sale_price);
                const subtotal = unitPrice * quantity;

                preparedItems.push({
                    product_id: product.id,
                    quantity,
                    unit_price: unitPrice,
                    subtotal
                });

                total += subtotal;
            }

            const [saleResult] = await connection.query(
                'INSERT INTO sales (total, payment_method, user_id) VALUES (?, ?, ?)',
                [total, payment_method, user_id]
            );

            for (const item of preparedItems) {
                await connection.query(
                    'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [saleResult.insertId, item.product_id, item.quantity, item.unit_price, item.subtotal]
                );
            }

            await connection.commit();

            res.status(201).json({
                ok: true,
                sale_id: saleResult.insertId,
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
