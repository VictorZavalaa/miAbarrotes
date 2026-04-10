const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const env = require('../config/env');

const router = express.Router();
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function ensureProductImagesTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS product_images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(255) NOT NULL,
            mime_type VARCHAR(100),
            size_bytes INT,
            is_primary TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id),
            INDEX idx_product_images_product (product_id)
        ) ENGINE=InnoDB
    `);
}

function normalizeBarcode(barcode) {
    if (barcode == null) return null;
    if (typeof barcode !== 'string') return barcode;

    const trimmed = barcode.trim();
    return trimmed === '' ? null : trimmed;
}

function normalizeSaleMode(value) {
    return value === 'WEIGHT' ? 'WEIGHT' : 'UNIT';
}

function normalizeBaseUnit(value, saleMode) {
    if (saleMode === 'WEIGHT') return 'kg';
    return value === 'kg' ? 'kg' : 'piece';
}

const productsMediaDir = path.join(env.mediaRoot, 'products');
fs.mkdirSync(productsMediaDir, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, productsMediaDir),
        filename: (_req, file, cb) => {
            const extension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
            cb(null, `${randomUUID()}${extension}`);
        }
    }),
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_MIME_TYPES.has((file.mimetype || '').toLowerCase())) {
            cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
            return;
        }

        cb(null, true);
    },
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});

router.get(
    '/',
    asyncHandler(async (_req, res) => {
        let rows;

        await ensureProductImagesTable();

        try {
            [rows] = await pool.query(
                `SELECT
                    p.id,
                    p.name,
                    p.brand,
                    p.barcode,
                    p.category,
                    p.sale_mode,
                    p.base_unit,
                    p.presentation_value,
                    p.presentation_unit,
                    p.sale_price,
                    p.cost_price,
                    p.stock,
                    p.min_stock,
                    p.is_active,
                    (
                        SELECT COALESCE(
                            NULLIF(pi.file_path, ''),
                            CONCAT('/media/products/', pi.file_name)
                        )
                        FROM product_images pi
                        WHERE pi.product_id = p.id
                        ORDER BY pi.is_primary DESC, pi.id DESC
                        LIMIT 1
                    ) AS image_url
                 FROM products p
                 ORDER BY p.name ASC`
            );
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_FIELD_ERROR') {
                [rows] = await pool.query(
                    `SELECT id, name, brand, barcode, category,
                            'UNIT' AS sale_mode,
                            'piece' AS base_unit,
                NULL AS presentation_value,
                NULL AS presentation_unit,
                            sale_price, cost_price, stock, min_stock, is_active,
                            NULL AS image_url
                     FROM products
                     ORDER BY name ASC`
                );
            } else {
                throw error;
            }
        }

        res.json({ ok: true, data: rows });
    })
);

router.post(
    '/:id/image',
    upload.single('image'),
    asyncHandler(async (req, res) => {
        await ensureProductImagesTable();

        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            const error = new Error('id de producto inválido');
            error.statusCode = 400;
            throw error;
        }

        if (!req.file) {
            const error = new Error('Debes enviar una imagen');
            error.statusCode = 400;
            throw error;
        }

        const [productRows] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);

        if (productRows.length === 0) {
            fs.unlink(req.file.path, () => { });
            const error = new Error('Producto no encontrado');
            error.statusCode = 404;
            throw error;
        }

        const relativePath = `/media/products/${req.file.filename}`;

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [productId]);

            await connection.query(
                `INSERT INTO product_images
                (product_id, file_name, file_path, mime_type, size_bytes, is_primary)
                VALUES (?, ?, ?, ?, ?, 1)`,
                [productId, req.file.filename, relativePath, req.file.mimetype, req.file.size]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            fs.unlink(req.file.path, () => { });
            throw error;
        } finally {
            connection.release();
        }

        res.status(201).json({
            ok: true,
            product_id: productId,
            image_url: relativePath
        });
    })
);

router.post(
    '/',
    asyncHandler(async (req, res) => {
        const {
            name,
            brand = null,
            barcode = null,
            category = null,
            sale_mode = 'UNIT',
            base_unit = 'piece',
            presentation_value = null,
            presentation_unit = null,
            sale_price,
            cost_price = null,
            stock = 0,
            min_stock = 0
        } = req.body;

        if (!name || sale_price == null) {
            const error = new Error('name y sale_price son obligatorios');
            error.statusCode = 400;
            throw error;
        }

        const normalizedBarcode = normalizeBarcode(barcode);
        const safeSaleMode = normalizeSaleMode(sale_mode);
        const safeBaseUnit = normalizeBaseUnit(base_unit, safeSaleMode);

        let result;
        try {
            [result] = await pool.query(
                `INSERT INTO products
      (name, brand, barcode, category, sale_mode, base_unit, presentation_value, presentation_unit, sale_price, cost_price, stock, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    brand,
                    normalizedBarcode,
                    category,
                    safeSaleMode,
                    safeBaseUnit,
                    presentation_value,
                    presentation_unit,
                    sale_price,
                    cost_price,
                    stock,
                    min_stock
                ]
            );
        } catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                [result] = await pool.query(
                    `INSERT INTO products
      (name, brand, barcode, category, sale_price, cost_price, stock, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        name,
                        brand,
                        normalizedBarcode,
                        category,
                        sale_price,
                        cost_price,
                        stock,
                        min_stock
                    ]
                );
            } else if (err.code === 'ER_DUP_ENTRY') {
                const error = new Error('El código de barras ya está en uso por otro producto.');
                error.statusCode = 409;
                throw error;
            } else {
                throw err;
            }
        }

        res.status(201).json({ ok: true, id: result.insertId });
    })
);

router.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            const error = new Error('id de producto inválido');
            error.statusCode = 400;
            throw error;
        }

        const {
            name,
            brand = null,
            barcode = null,
            category = null,
            sale_mode = 'UNIT',
            base_unit = 'piece',
            presentation_value = null,
            presentation_unit = null,
            sale_price,
            cost_price = null,
            stock = 0,
            min_stock = 0,
            is_active = 1
        } = req.body;

        if (!name || sale_price == null) {
            const error = new Error('name y sale_price son obligatorios');
            error.statusCode = 400;
            throw error;
        }

        const normalizedBarcode = normalizeBarcode(barcode);
        const safeSaleMode = normalizeSaleMode(sale_mode);
        const safeBaseUnit = normalizeBaseUnit(base_unit, safeSaleMode);

        let result;
        try {
            [result] = await pool.query(
                `UPDATE products
             SET name = ?,
                 brand = ?,
                 barcode = ?,
                 category = ?,
                 sale_mode = ?,
                 base_unit = ?,
                 presentation_value = ?,
                 presentation_unit = ?,
                 sale_price = ?,
                 cost_price = ?,
                 stock = ?,
                 min_stock = ?,
                 is_active = ?
             WHERE id = ?`,
                [
                    name,
                    brand,
                    normalizedBarcode,
                    category,
                    safeSaleMode,
                    safeBaseUnit,
                    presentation_value,
                    presentation_unit,
                    sale_price,
                    cost_price,
                    stock,
                    min_stock,
                    Number(is_active) ? 1 : 0,
                    productId
                ]
            );
        } catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                [result] = await pool.query(
                    `UPDATE products
             SET name = ?,
                 brand = ?,
                 barcode = ?,
                 category = ?,
                 sale_price = ?,
                 cost_price = ?,
                 stock = ?,
                 min_stock = ?,
                 is_active = ?
             WHERE id = ?`,
                    [
                        name,
                        brand,
                        normalizedBarcode,
                        category,
                        sale_price,
                        cost_price,
                        stock,
                        min_stock,
                        Number(is_active) ? 1 : 0,
                        productId
                    ]
                );
            } else if (err.code === 'ER_DUP_ENTRY') {
                const error = new Error('El código de barras ya está en uso por otro producto.');
                error.statusCode = 409;
                throw error;
            } else {
                throw err;
            }
        }

        if (result.affectedRows === 0) {
            const error = new Error('Producto no encontrado');
            error.statusCode = 404;
            throw error;
        }

        res.json({ ok: true, id: productId });
    })
);

router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        await ensureProductImagesTable();

        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            const error = new Error('id de producto inválido');
            error.statusCode = 400;
            throw error;
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Relaciones "ligeras" que sí se pueden limpiar al borrar producto.
            await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
            await connection.query('DELETE FROM supplier_products WHERE product_id = ?', [productId]);

            const [result] = await connection.query('DELETE FROM products WHERE id = ?', [productId]);

            if (result.affectedRows === 0) {
                const error = new Error('Producto no encontrado');
                error.statusCode = 404;
                throw error;
            }

            await connection.commit();

            res.json({ ok: true, id: productId });
        } catch (err) {
            await connection.rollback();

            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                const error = new Error(
                    'No se puede eliminar: el producto tiene historial en ventas, compras o movimientos de inventario. Puedes desactivarlo en lugar de borrarlo.'
                );
                error.statusCode = 409;
                throw error;
            }

            throw err;
        } finally {
            connection.release();
        }
    })
);

module.exports = router;
