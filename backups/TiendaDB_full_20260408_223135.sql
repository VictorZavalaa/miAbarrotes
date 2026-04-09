-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: TiendaDB
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `size_bytes` int(11) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (5,22,'362cf444-e5ec-462e-a87d-51e71386a946.jpg','/media/products/362cf444-e5ec-462e-a87d-51e71386a946.jpg','image/jpeg',88905,1,'2026-04-02 22:24:19'),(6,24,'b59befea-d01a-460c-ac8e-14bd93dcfbd4.webp','/media/products/b59befea-d01a-460c-ac8e-14bd93dcfbd4.webp','image/webp',46688,1,'2026-04-02 22:32:45'),(8,14,'921a1d7a-eae6-4dd7-9cad-827016be8cff.webp','/media/products/921a1d7a-eae6-4dd7-9cad-827016be8cff.webp','image/webp',243518,0,'2026-04-02 22:36:59'),(10,20,'e15aacb6-8bcf-49f2-b7cb-114b3623e228.webp','/media/products/e15aacb6-8bcf-49f2-b7cb-114b3623e228.webp','image/webp',33808,1,'2026-04-02 23:33:27'),(11,23,'9c9e30de-86ab-4d41-8e25-a0130b5b56fe.webp','/media/products/9c9e30de-86ab-4d41-8e25-a0130b5b56fe.webp','image/webp',15628,1,'2026-04-02 23:36:20'),(12,14,'2f783e96-dbb2-40d1-92a1-86f23a116010.webp','/media/products/2f783e96-dbb2-40d1-92a1-86f23a116010.webp','image/webp',12746,0,'2026-04-03 00:14:28'),(13,14,'f8f54b8b-2e0f-42d1-adbe-d44801f46dc8.webp','/media/products/f8f54b8b-2e0f-42d1-adbe-d44801f46dc8.webp','image/webp',243518,1,'2026-04-03 00:14:35'),(14,33,'a24066f3-02d3-402a-8faa-b18b99644325.webp','/media/products/a24066f3-02d3-402a-8faa-b18b99644325.webp','image/webp',40388,1,'2026-04-03 09:58:00'),(15,34,'99a32ecc-9b7b-4b18-b246-9f974b6ad556.webp','/media/products/99a32ecc-9b7b-4b18-b246-9f974b6ad556.webp','image/webp',20642,1,'2026-04-03 10:00:44'),(16,35,'eada28b0-e8e3-42d4-b07c-c6d62625d77b.webp','/media/products/eada28b0-e8e3-42d4-b07c-c6d62625d77b.webp','image/webp',223592,1,'2026-04-03 10:03:33'),(17,36,'7e8fec07-c691-4e4e-bbda-cbbcd4905261.jpg','/media/products/7e8fec07-c691-4e4e-bbda-cbbcd4905261.jpg','image/jpeg',40472,1,'2026-04-07 08:48:05'),(18,38,'c696ce6c-34af-412e-9b60-647f49de9e59.jpg','/media/products/c696ce6c-34af-412e-9b60-647f49de9e59.jpg','image/jpeg',54695,1,'2026-04-07 09:16:59');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`),
  KEY `idx_products_name` (`name`),
  KEY `idx_products_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (2,'Pan Tostado Clasico','Bimbo',NULL,'Panaderia','UNIT','piece',210.00,'g',34.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(3,'Pan Tostado DobleFibra','Bimbo',NULL,'Panaderia','UNIT','piece',250.00,'g',36.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(4,'Pan Molido Clasico','Bimbo',NULL,'Panaderia','UNIT','piece',252.00,'g',28.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(5,'Pan Molido Empanizador Crujiente','Bimbo',NULL,'Panaderia','UNIT','piece',175.00,'g',28.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(6,'Pan Bimbo Blanco','Bimbo',NULL,'Panaderia','UNIT','piece',620.00,'g',49.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(7,'Pan Bimbo Blanco Chico','Bimbo',NULL,'Panaderia','UNIT','piece',300.00,'g',25.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(8,'Pan Bimbo Integral','Bimbo',NULL,'Panaderia','UNIT','piece',620.00,'g',52.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(9,'Pan Bimbo Integral Chico','Bimbo',NULL,'Panaderia','UNIT','piece',300.00,'g',28.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(10,'Medias Noches Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',340.00,'g',46.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(11,'Panque con Nuez Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',280.00,'g',42.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(12,'Panque con Marmol Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',280.00,'g',42.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(13,'Panque con Pasas Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',280.00,'g',42.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(14,'Colchones Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',130.00,'g',16.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(15,'Roles con canela Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',180.00,'g',25.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(16,'Mantecadas con chispas sabor a chocolate Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',190.00,'g',32.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(17,'Mantecadas sabor vainilla Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',180.00,'g',32.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(18,'Mantecadas sabor Marmol','Bimbo',NULL,'Panaderia','UNIT','piece',187.50,'g',32.00,NULL,4.000,0.000,1,'2026-04-02 21:00:21','2026-04-03 10:20:39'),(19,'Mantecadas con nuez Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',184.50,'g',32.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(20,'Donas Bimbo','Bimbo','7501030474227','Panaderia','UNIT','piece',158.00,'g',22.00,NULL,4.000,0.000,1,'2026-04-02 21:00:21','2026-04-07 08:47:04'),(21,'Rebanadas Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',55.00,'g',8.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(22,'Bimbuñuelos Bimbo','Bimbo','7501030472698','Panaderia','UNIT','piece',99.00,'g',22.00,NULL,1.000,0.000,1,'2026-04-02 21:00:21','2026-04-08 20:36:26'),(23,'Madalenas 3 pz Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',93.00,'g',20.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(24,'Bran Frut Fresa/Piña Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',58.00,'g',12.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(25,'Nito Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',62.00,'g',17.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(26,'Nido Duo','Bimbo',NULL,'Panaderia','UNIT','piece',124.00,'g',28.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(33,'Jamon','Kir',NULL,'Carniceria','WEIGHT','kg',NULL,NULL,115.00,90.00,4000.000,500.000,1,'2026-04-03 09:58:00','2026-04-03 09:58:00'),(34,'Jitomate','X',NULL,'Fruteria','WEIGHT','kg',NULL,NULL,58.00,35.00,1200.000,200.000,1,'2026-04-03 10:00:44','2026-04-07 09:31:56'),(35,'Hi Dog - Adulto','Hi Dog',NULL,'Croqueta','WEIGHT','kg',NULL,NULL,35.00,22.00,25000.000,2000.000,1,'2026-04-03 10:03:33','2026-04-03 10:03:33'),(36,'Caldo de pollo','Knorr','7501005180306','Alimento','UNIT','piece',10.50,'g',6.00,4.00,3.000,0.000,1,'2026-04-07 08:47:04','2026-04-07 09:15:05'),(37,'Mazapan','de la Rosa','724869007214','Dulce','UNIT','piece',NULL,NULL,6.00,4.00,6.000,0.000,1,'2026-04-07 08:47:04','2026-04-07 09:04:54'),(38,'Burst agua purificada','burst',NULL,'Bebida','UNIT','piece',1.50,'L',17.00,14.00,10.000,0.000,1,'2026-04-07 09:16:59','2026-04-07 09:16:59');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_items`
--

DROP TABLE IF EXISTS `purchase_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_purchase_items_purchase` (`purchase_id`),
  KEY `idx_purchase_items_product` (`product_id`),
  CONSTRAINT `fk_purchase_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_purchase_items_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_items`
--

LOCK TABLES `purchase_items` WRITE;
/*!40000 ALTER TABLE `purchase_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_increase_stock_after_purchase_item
AFTER INSERT ON purchase_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET stock = stock + NEW.quantity,
        cost_price = NEW.unit_cost
    WHERE id = NEW.product_id;

    INSERT INTO stock_movements (product_id, movement_type, quantity, reference_table, reference_id, notes)
    VALUES (NEW.product_id, 'PURCHASE_IN', NEW.quantity, 'purchase_items', NEW.id, 'Entrada por compra a proveedor');
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `invoice_number` varchar(80) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('RECEIVED','CANCELLED') NOT NULL DEFAULT 'RECEIVED',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_purchases_user` (`user_id`),
  KEY `idx_purchases_supplier` (`supplier_id`),
  KEY `idx_purchases_created_at` (`created_at`),
  CONSTRAINT `fk_purchases_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `fk_purchases_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sale_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sale_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sale_items_sale` (`sale_id`),
  KEY `idx_sale_items_product` (`product_id`),
  CONSTRAINT `fk_sale_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` VALUES (1,1,18,1.000,32.00,32.00,'2026-04-03 10:20:39'),(2,1,22,2.000,22.00,44.00,'2026-04-03 10:20:39'),(3,2,22,1.000,22.00,22.00,'2026-04-07 09:46:41'),(4,3,22,1.000,22.00,22.00,'2026-04-07 09:48:35'),(5,4,22,4.000,22.00,88.00,'2026-04-07 10:23:38'),(6,5,22,1.000,22.00,22.00,'2026-04-08 20:36:26');
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_validate_stock_before_sale_item
BEFORE INSERT ON sale_items
FOR EACH ROW
BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_decrease_stock_after_sale_item
AFTER INSERT ON sale_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;

    INSERT INTO stock_movements (product_id, movement_type, quantity, reference_table, reference_id, notes)
    VALUES (NEW.product_id, 'SALE_OUT', NEW.quantity, 'sale_items', NEW.id, 'Salida por venta');
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `total` decimal(10,2) NOT NULL,
  `payment_method` enum('CASH','CARD','TRANSFER','MIXED') NOT NULL DEFAULT 'CASH',
  `status` enum('COMPLETED','CANCELLED') NOT NULL DEFAULT 'COMPLETED',
  `synced` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sales_created_at` (`created_at`),
  KEY `fk_sales_user` (`user_id`),
  CONSTRAINT `fk_sales_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,76.00,'CASH','COMPLETED',0,NULL,'2026-04-03 10:20:39'),(2,22.00,'CASH','COMPLETED',0,NULL,'2026-04-07 09:46:41'),(3,22.00,'CASH','COMPLETED',0,NULL,'2026-04-07 09:48:35'),(4,88.00,'CASH','COMPLETED',0,1,'2026-04-07 10:23:38'),(5,22.00,'CASH','COMPLETED',0,1,'2026-04-08 20:36:26');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `movement_type` enum('SALE_OUT','PURCHASE_IN','ADJUSTMENT') NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `reference_table` varchar(40) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_stock_movements_product` (`product_id`),
  KEY `idx_stock_movements_created_at` (`created_at`),
  CONSTRAINT `fk_stock_movements_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
INSERT INTO `stock_movements` VALUES (1,18,'SALE_OUT',1.000,'sale_items',1,'Salida por venta','2026-04-03 10:20:39'),(2,22,'SALE_OUT',2.000,'sale_items',2,'Salida por venta','2026-04-03 10:20:39'),(3,22,'SALE_OUT',1.000,'sale_items',3,'Salida por venta','2026-04-07 09:46:41'),(4,22,'SALE_OUT',1.000,'sale_items',4,'Salida por venta','2026-04-07 09:48:35'),(5,22,'SALE_OUT',4.000,'sale_items',5,'Salida por venta','2026-04-07 10:23:38'),(6,22,'SALE_OUT',1.000,'sale_items',6,'Salida por venta','2026-04-08 20:36:26');
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_products`
--

DROP TABLE IF EXISTS `supplier_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `supplier_products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `supplier_sku` varchar(80) DEFAULT NULL,
  `last_cost` decimal(10,2) DEFAULT NULL,
  `lead_time_days` int(11) DEFAULT NULL,
  `is_preferred` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_supplier_product` (`supplier_id`,`product_id`),
  KEY `fk_supplier_products_product` (`product_id`),
  CONSTRAINT `fk_supplier_products_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_supplier_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_products`
--

LOCK TABLES `supplier_products` WRITE;
/*!40000 ALTER TABLE `supplier_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `supplier_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_visits`
--

DROP TABLE IF EXISTS `supplier_visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `supplier_visits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL,
  `visit_date` date NOT NULL,
  `expected_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('PENDING','PAID','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_supplier_visits_date` (`visit_date`),
  KEY `idx_supplier_visits_supplier` (`supplier_id`),
  CONSTRAINT `fk_supplier_visits_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_visits`
--

LOCK TABLES `supplier_visits` WRITE;
/*!40000 ALTER TABLE `supplier_visits` DISABLE KEYS */;
INSERT INTO `supplier_visits` VALUES (1,1,'2026-04-04',1800.00,'PAID',NULL,'2026-04-03 10:19:09','2026-04-08 20:38:48'),(2,1,'2026-04-04',200.00,'PAID',NULL,'2026-04-03 10:19:24','2026-04-08 20:38:53');
/*!40000 ALTER TABLE `supplier_visits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_suppliers_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Cocacola','Visita','7775849309',NULL,NULL,NULL,NULL,'WEEKLY',1,'2026-04-03 10:18:31','2026-04-03 10:18:31'),(2,'x','jarrito','798790879',NULL,NULL,NULL,'[\"MON\",\"TUE\",\"SUN\"]','WEEKLY',1,'2026-04-08 22:01:18','2026-04-08 22:01:18');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_logs`
--

DROP TABLE IF EXISTS `sync_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sync_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `direction` enum('LOCAL_TO_CLOUD','CLOUD_TO_LOCAL') NOT NULL,
  `status` enum('SUCCESS','ERROR') NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sync_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_logs`
--

LOCK TABLES `sync_logs` WRITE;
/*!40000 ALTER TABLE `sync_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(80) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','CAJERO') NOT NULL DEFAULT 'ADMIN',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','12345678','ADMIN',1,'2026-04-02 20:26:55','2026-04-07 10:10:11',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-08 22:31:35
