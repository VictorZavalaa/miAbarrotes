-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 10, 2026 at 02:26 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `TiendaDB`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `sale_mode` enum('UNIT','WEIGHT') NOT NULL DEFAULT 'UNIT',
  `base_unit` enum('piece','kg') NOT NULL DEFAULT 'piece',
  `presentation_value` decimal(10,2) DEFAULT NULL,
  `presentation_unit` varchar(10) DEFAULT NULL,
  `sale_price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `stock` decimal(12,3) NOT NULL DEFAULT 0.000,
  `min_stock` decimal(12,3) NOT NULL DEFAULT 0.000,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `brand`, `barcode`, `category`, `sale_mode`, `base_unit`, `presentation_value`, `presentation_unit`, `sale_price`, `cost_price`, `stock`, `min_stock`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'Pan Tostado Clasico', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 210.00, 'g', 34.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(3, 'Pan Tostado DobleFibra', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 250.00, 'g', 36.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(4, 'Pan Molido Clasico', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 252.00, 'g', 28.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(5, 'Pan Molido Empanizador Crujiente', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 175.00, 'g', 28.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(6, 'Pan Bimbo Blanco', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 620.00, 'g', 49.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(7, 'Pan Bimbo Blanco Chico', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 300.00, 'g', 25.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(8, 'Pan Bimbo Integral', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 620.00, 'g', 52.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(9, 'Pan Bimbo Integral Chico', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 300.00, 'g', 28.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(10, 'Medias Noches Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 340.00, 'g', 46.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(11, 'Panque con Nuez Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 280.00, 'g', 42.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(12, 'Panque con Marmol Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 280.00, 'g', 42.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(13, 'Panque con Pasas Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 280.00, 'g', 42.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(14, 'Colchones Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 130.00, 'g', 16.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(15, 'Roles con canela Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 180.00, 'g', 25.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(16, 'Mantecadas con chispas sabor a chocolate Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 190.00, 'g', 32.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(17, 'Mantecadas sabor vainilla Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 180.00, 'g', 32.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(18, 'Mantecadas sabor Marmol', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 187.50, 'g', 32.00, NULL, 4.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-03 10:20:39'),
(19, 'Mantecadas con nuez Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 184.50, 'g', 32.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(20, 'Donas Bimbo', 'Bimbo', '7501030474227', 'Panaderia', 'UNIT', 'piece', 158.00, 'g', 22.00, NULL, 4.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-07 08:47:04'),
(21, 'Rebanadas Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 55.00, 'g', 8.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(22, 'Bimbuñuelos Bimbo', 'Bimbo', '7501030472698', 'Panaderia', 'UNIT', 'piece', 99.00, 'g', 22.00, NULL, 1.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-08 20:36:26'),
(23, 'Madalenas 3 pz Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 93.00, 'g', 20.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(24, 'Bran Frut Fresa/Piña Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 58.00, 'g', 12.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(25, 'Nito Bimbo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 62.00, 'g', 17.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(26, 'Nido Duo', 'Bimbo', NULL, 'Panaderia', 'UNIT', 'piece', 124.00, 'g', 28.00, NULL, 0.000, 0.000, 1, '2026-04-02 21:00:21', '2026-04-02 21:00:21'),
(33, 'Jamon', 'Kir', NULL, 'Carniceria', 'WEIGHT', 'kg', NULL, NULL, 115.00, 90.00, 4000.000, 500.000, 1, '2026-04-03 09:58:00', '2026-04-03 09:58:00'),
(34, 'Jitomate', 'X', NULL, 'Fruteria', 'WEIGHT', 'kg', NULL, NULL, 58.00, 35.00, 1200.000, 200.000, 1, '2026-04-03 10:00:44', '2026-04-07 09:31:56'),
(35, 'Hi Dog - Adulto', 'Hi Dog', NULL, 'Croqueta', 'WEIGHT', 'kg', NULL, NULL, 35.00, 22.00, 25000.000, 2000.000, 1, '2026-04-03 10:03:33', '2026-04-03 10:03:33'),
(36, 'Caldo de pollo', 'Knorr', '7501005180306', 'Alimento', 'UNIT', 'piece', 10.50, 'g', 6.00, 4.00, 3.000, 0.000, 1, '2026-04-07 08:47:04', '2026-04-07 09:15:05'),
(37, 'Mazapan', 'de la Rosa', '724869007214', 'Dulce', 'UNIT', 'piece', NULL, NULL, 6.00, 4.00, 6.000, 0.000, 1, '2026-04-07 08:47:04', '2026-04-07 09:04:54'),
(38, 'Burst agua purificada', 'burst', NULL, 'Bebida', 'UNIT', 'piece', 1.50, 'L', 17.00, 14.00, 10.000, 0.000, 1, '2026-04-07 09:16:59', '2026-04-07 09:16:59');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `size_bytes` int(11) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `file_name`, `file_path`, `mime_type`, `size_bytes`, `is_primary`, `created_at`) VALUES
(5, 22, '362cf444-e5ec-462e-a87d-51e71386a946.jpg', '/media/products/362cf444-e5ec-462e-a87d-51e71386a946.jpg', 'image/jpeg', 88905, 1, '2026-04-02 22:24:19'),
(6, 24, 'b59befea-d01a-460c-ac8e-14bd93dcfbd4.webp', '/media/products/b59befea-d01a-460c-ac8e-14bd93dcfbd4.webp', 'image/webp', 46688, 1, '2026-04-02 22:32:45'),
(8, 14, '921a1d7a-eae6-4dd7-9cad-827016be8cff.webp', '/media/products/921a1d7a-eae6-4dd7-9cad-827016be8cff.webp', 'image/webp', 243518, 0, '2026-04-02 22:36:59'),
(10, 20, 'e15aacb6-8bcf-49f2-b7cb-114b3623e228.webp', '/media/products/e15aacb6-8bcf-49f2-b7cb-114b3623e228.webp', 'image/webp', 33808, 1, '2026-04-02 23:33:27'),
(11, 23, '9c9e30de-86ab-4d41-8e25-a0130b5b56fe.webp', '/media/products/9c9e30de-86ab-4d41-8e25-a0130b5b56fe.webp', 'image/webp', 15628, 1, '2026-04-02 23:36:20'),
(12, 14, '2f783e96-dbb2-40d1-92a1-86f23a116010.webp', '/media/products/2f783e96-dbb2-40d1-92a1-86f23a116010.webp', 'image/webp', 12746, 0, '2026-04-03 00:14:28'),
(13, 14, 'f8f54b8b-2e0f-42d1-adbe-d44801f46dc8.webp', '/media/products/f8f54b8b-2e0f-42d1-adbe-d44801f46dc8.webp', 'image/webp', 243518, 1, '2026-04-03 00:14:35'),
(14, 33, 'a24066f3-02d3-402a-8faa-b18b99644325.webp', '/media/products/a24066f3-02d3-402a-8faa-b18b99644325.webp', 'image/webp', 40388, 1, '2026-04-03 09:58:00'),
(15, 34, '99a32ecc-9b7b-4b18-b246-9f974b6ad556.webp', '/media/products/99a32ecc-9b7b-4b18-b246-9f974b6ad556.webp', 'image/webp', 20642, 1, '2026-04-03 10:00:44'),
(16, 35, 'eada28b0-e8e3-42d4-b07c-c6d62625d77b.webp', '/media/products/eada28b0-e8e3-42d4-b07c-c6d62625d77b.webp', 'image/webp', 223592, 1, '2026-04-03 10:03:33'),
(17, 36, '7e8fec07-c691-4e4e-bbda-cbbcd4905261.jpg', '/media/products/7e8fec07-c691-4e4e-bbda-cbbcd4905261.jpg', 'image/jpeg', 40472, 1, '2026-04-07 08:48:05'),
(18, 38, 'c696ce6c-34af-412e-9b60-647f49de9e59.jpg', '/media/products/c696ce6c-34af-412e-9b60-647f49de9e59.jpg', 'image/jpeg', 54695, 1, '2026-04-07 09:16:59');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `invoice_number` varchar(80) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('RECEIVED','CANCELLED') NOT NULL DEFAULT 'RECEIVED',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `purchase_items`
--
DELIMITER $$
CREATE TRIGGER `trg_increase_stock_after_purchase_item` AFTER INSERT ON `purchase_items` FOR EACH ROW BEGIN
    UPDATE products
    SET stock = stock + NEW.quantity,
        cost_price = NEW.unit_cost
    WHERE id = NEW.product_id;

    INSERT INTO stock_movements (product_id, movement_type, quantity, reference_table, reference_id, notes)
    VALUES (NEW.product_id, 'PURCHASE_IN', NEW.quantity, 'purchase_items', NEW.id, 'Entrada por compra a proveedor');
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `payment_method` enum('CASH','CARD','TRANSFER','MIXED') NOT NULL DEFAULT 'CASH',
  `status` enum('COMPLETED','CANCELLED') NOT NULL DEFAULT 'COMPLETED',
  `synced` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `total`, `payment_method`, `status`, `synced`, `user_id`, `created_at`) VALUES
(1, 76.00, 'CASH', 'COMPLETED', 0, NULL, '2026-04-03 10:20:39'),
(2, 22.00, 'CASH', 'COMPLETED', 0, NULL, '2026-04-07 09:46:41'),
(3, 22.00, 'CASH', 'COMPLETED', 0, NULL, '2026-04-07 09:48:35'),
(4, 88.00, 'CASH', 'COMPLETED', 0, 1, '2026-04-07 10:23:38'),
(5, 22.00, 'CASH', 'COMPLETED', 0, 1, '2026-04-08 20:36:26');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `quantity`, `unit_price`, `subtotal`, `created_at`) VALUES
(1, 1, 18, 1.000, 32.00, 32.00, '2026-04-03 10:20:39'),
(2, 1, 22, 2.000, 22.00, 44.00, '2026-04-03 10:20:39'),
(3, 2, 22, 1.000, 22.00, 22.00, '2026-04-07 09:46:41'),
(4, 3, 22, 1.000, 22.00, 22.00, '2026-04-07 09:48:35'),
(5, 4, 22, 4.000, 22.00, 88.00, '2026-04-07 10:23:38'),
(6, 5, 22, 1.000, 22.00, 22.00, '2026-04-08 20:36:26');

--
-- Triggers `sale_items`
--
DELIMITER $$
CREATE TRIGGER `trg_decrease_stock_after_sale_item` AFTER INSERT ON `sale_items` FOR EACH ROW BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;

    INSERT INTO stock_movements (product_id, movement_type, quantity, reference_table, reference_id, notes)
    VALUES (NEW.product_id, 'SALE_OUT', NEW.quantity, 'sale_items', NEW.id, 'Salida por venta');
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_validate_stock_before_sale_item` BEFORE INSERT ON `sale_items` FOR EACH ROW BEGIN
    DECLARE current_stock INT;

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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `movement_type` enum('SALE_OUT','PURCHASE_IN','ADJUSTMENT') NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `reference_table` varchar(40) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `reference_table`, `reference_id`, `notes`, `created_at`) VALUES
(1, 18, 'SALE_OUT', 1.000, 'sale_items', 1, 'Salida por venta', '2026-04-03 10:20:39'),
(2, 22, 'SALE_OUT', 2.000, 'sale_items', 2, 'Salida por venta', '2026-04-03 10:20:39'),
(3, 22, 'SALE_OUT', 1.000, 'sale_items', 3, 'Salida por venta', '2026-04-07 09:46:41'),
(4, 22, 'SALE_OUT', 1.000, 'sale_items', 4, 'Salida por venta', '2026-04-07 09:48:35'),
(5, 22, 'SALE_OUT', 4.000, 'sale_items', 5, 'Salida por venta', '2026-04-07 10:23:38'),
(6, 22, 'SALE_OUT', 1.000, 'sale_items', 6, 'Salida por venta', '2026-04-08 20:36:26');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `contact_name` varchar(120) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `visit_days_json` text DEFAULT NULL,
  `visit_frequency` varchar(20) NOT NULL DEFAULT 'WEEKLY',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `contact_name`, `phone`, `email`, `address`, `notes`, `visit_days_json`, `visit_frequency`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Cocacola', 'Visita', '7775849309', NULL, NULL, NULL, NULL, 'WEEKLY', 1, '2026-04-03 10:18:31', '2026-04-03 10:18:31'),
(2, 'x', 'jarrito', '798790879', NULL, NULL, NULL, '[\"MON\",\"TUE\",\"SUN\"]', 'WEEKLY', 1, '2026-04-08 22:01:18', '2026-04-08 22:01:18');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_products`
--

CREATE TABLE `supplier_products` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `supplier_sku` varchar(80) DEFAULT NULL,
  `last_cost` decimal(10,2) DEFAULT NULL,
  `lead_time_days` int(11) DEFAULT NULL,
  `is_preferred` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier_visits`
--

CREATE TABLE `supplier_visits` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `visit_date` date NOT NULL,
  `expected_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('PENDING','PAID','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supplier_visits`
--

INSERT INTO `supplier_visits` (`id`, `supplier_id`, `visit_date`, `expected_amount`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-04-04', 1800.00, 'PAID', NULL, '2026-04-03 10:19:09', '2026-04-08 20:38:48'),
(2, 1, '2026-04-04', 200.00, 'PAID', NULL, '2026-04-03 10:19:24', '2026-04-08 20:38:53');

-- --------------------------------------------------------

--
-- Table structure for table `sync_logs`
--

CREATE TABLE `sync_logs` (
  `id` int(11) NOT NULL,
  `direction` enum('LOCAL_TO_CLOUD','CLOUD_TO_LOCAL') NOT NULL,
  `status` enum('SUCCESS','ERROR') NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(80) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','CAJERO') NOT NULL DEFAULT 'ADMIN',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_admin` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`, `is_admin`) VALUES
(1, 'admin', '12345678', 'ADMIN', 1, '2026-04-02 20:26:55', '2026-04-07 10:10:11', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `idx_products_name` (`name`),
  ADD KEY `idx_products_category` (`category`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_images_product` (`product_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_purchases_user` (`user_id`),
  ADD KEY `idx_purchases_supplier` (`supplier_id`),
  ADD KEY `idx_purchases_created_at` (`created_at`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_purchase_items_purchase` (`purchase_id`),
  ADD KEY `idx_purchase_items_product` (`product_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sales_created_at` (`created_at`),
  ADD KEY `fk_sales_user` (`user_id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sale_items_sale` (`sale_id`),
  ADD KEY `idx_sale_items_product` (`product_id`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stock_movements_product` (`product_id`),
  ADD KEY `idx_stock_movements_created_at` (`created_at`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_suppliers_name` (`name`);

--
-- Indexes for table `supplier_products`
--
ALTER TABLE `supplier_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_supplier_product` (`supplier_id`,`product_id`),
  ADD KEY `fk_supplier_products_product` (`product_id`);

--
-- Indexes for table `supplier_visits`
--
ALTER TABLE `supplier_visits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_supplier_visits_date` (`visit_date`),
  ADD KEY `idx_supplier_visits_supplier` (`supplier_id`);

--
-- Indexes for table `sync_logs`
--
ALTER TABLE `sync_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sync_logs_created_at` (`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `supplier_products`
--
ALTER TABLE `supplier_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplier_visits`
--
ALTER TABLE `supplier_visits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sync_logs`
--
ALTER TABLE `sync_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `fk_purchases_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `fk_purchases_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `fk_purchase_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_purchase_items_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`);

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `fk_sales_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `fk_sale_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`);

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `fk_stock_movements_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `supplier_products`
--
ALTER TABLE `supplier_products`
  ADD CONSTRAINT `fk_supplier_products_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_supplier_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);

--
-- Constraints for table `supplier_visits`
--
ALTER TABLE `supplier_visits`
  ADD CONSTRAINT `fk_supplier_visits_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
