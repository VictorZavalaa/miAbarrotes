DROP DATABASE IF EXISTS TiendaDB;
CREATE DATABASE TiendaDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE TiendaDB;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CAJERO') NOT NULL DEFAULT 'ADMIN',
    is_admin TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- PRODUCTS
-- =========================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100),
    barcode VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    sale_mode ENUM('UNIT', 'WEIGHT') NOT NULL DEFAULT 'UNIT',
    base_unit ENUM('piece', 'kg') NOT NULL DEFAULT 'piece',
    presentation_value DECIMAL(10,2),
    presentation_unit VARCHAR(10),
    sale_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    stock DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    min_stock DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_name (name),
    INDEX idx_products_category (category)
) ENGINE=InnoDB;

CREATE TABLE product_images (
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
) ENGINE=InnoDB;

-- =========================
-- SUPPLIERS (PROVEEDORES)
-- =========================
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(120),
    phone VARCHAR(30),
    email VARCHAR(120),
    address VARCHAR(255),
    notes TEXT,
    visit_days_json TEXT,
    visit_frequency VARCHAR(20) NOT NULL DEFAULT 'WEEKLY',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_suppliers_name (name)
) ENGINE=InnoDB;

-- Catálogo de productos que maneja cada proveedor
CREATE TABLE supplier_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    product_id INT NOT NULL,
    supplier_sku VARCHAR(80),
    last_cost DECIMAL(10,2),
    lead_time_days INT,
    is_preferred TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_supplier_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT fk_supplier_products_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT uq_supplier_product UNIQUE (supplier_id, product_id)
) ENGINE=InnoDB;

-- Agenda de visitas/pagos programados por proveedor
CREATE TABLE supplier_visits (
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
) ENGINE=InnoDB;

-- =========================
-- SALES
-- =========================
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CASH', 'CARD', 'TRANSFER', 'MIXED') NOT NULL DEFAULT 'CASH',
    status ENUM('COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    synced TINYINT(1) NOT NULL DEFAULT 0,
    user_id INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sales_created_at (created_at),
    CONSTRAINT fk_sales_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) REFERENCES sales(id),
    CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_sale_items_sale (sale_id),
    INDEX idx_sale_items_product (product_id)
) ENGINE=InnoDB;

-- =========================
-- PURCHASES (ENTRADAS DE PROVEEDOR)
-- =========================
CREATE TABLE purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    user_id INT,
    invoice_number VARCHAR(80),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'RECEIVED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchases_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT fk_purchases_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_purchases_supplier (supplier_id),
    INDEX idx_purchases_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE purchase_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchase_items_purchase FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    CONSTRAINT fk_purchase_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_purchase_items_purchase (purchase_id),
    INDEX idx_purchase_items_product (product_id)
) ENGINE=InnoDB;

-- =========================
-- SYNC / AUDIT
-- =========================
CREATE TABLE sync_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    direction ENUM('LOCAL_TO_CLOUD', 'CLOUD_TO_LOCAL') NOT NULL,
    status ENUM('SUCCESS', 'ERROR') NOT NULL,
    details TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sync_logs_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    movement_type ENUM('SALE_OUT', 'PURCHASE_IN', 'ADJUSTMENT') NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    reference_table VARCHAR(40),
    reference_id INT,
    notes VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_movements_product FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_stock_movements_product (product_id),
    INDEX idx_stock_movements_created_at (created_at)
) ENGINE=InnoDB;

-- =========================
-- TRIGGERS
-- =========================
DELIMITER $$

CREATE TRIGGER trg_validate_stock_before_sale_item
BEFORE INSERT ON sale_items
FOR EACH ROW
BEGIN
    DECLARE current_stock DECIMAL(12,3);

    SELECT stock INTO current_stock
    FROM products
    WHERE id = NEW.product_id
    FOR UPDATE;

    IF current_stock IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto no encontrado para la venta';
    END IF;

    IF current_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para completar la venta';
    END IF;
END$$

CREATE TRIGGER trg_decrease_stock_after_sale_item
AFTER INSERT ON sale_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;

    INSERT INTO stock_movements (product_id, movement_type, quantity, reference_table, reference_id, notes)
    VALUES (NEW.product_id, 'SALE_OUT', NEW.quantity, 'sale_items', NEW.id, 'Salida por venta');
END$$

CREATE TRIGGER trg_increase_stock_after_purchase_item
AFTER INSERT ON purchase_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET stock = stock + NEW.quantity,
        cost_price = NEW.unit_cost
    WHERE id = NEW.product_id;

    INSERT INTO stock_movements (product_id, movement_type, quantity, reference_table, reference_id, notes)
    VALUES (NEW.product_id, 'PURCHASE_IN', NEW.quantity, 'purchase_items', NEW.id, 'Entrada por compra a proveedor');
END$$

DELIMITER ;

-- Usuario inicial opcional para pruebas (cambia el hash en producción)
INSERT INTO users (username, password_hash, role, is_admin)
VALUES ('admin', 'admin123', 'ADMIN', 1)
ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    is_admin = VALUES(is_admin),
    is_active = 1;

