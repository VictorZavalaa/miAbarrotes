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
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
REPLACE INTO `product_images` (`id`, `product_id`, `file_name`, `file_path`, `mime_type`, `size_bytes`, `is_primary`, `created_at`) VALUES (5,22,'362cf444-e5ec-462e-a87d-51e71386a946.jpg','/media/products/362cf444-e5ec-462e-a87d-51e71386a946.jpg','image/jpeg',88905,1,'2026-04-02 22:24:19'),(6,24,'b59befea-d01a-460c-ac8e-14bd93dcfbd4.webp','/media/products/b59befea-d01a-460c-ac8e-14bd93dcfbd4.webp','image/webp',46688,1,'2026-04-02 22:32:45'),(8,14,'921a1d7a-eae6-4dd7-9cad-827016be8cff.webp','/media/products/921a1d7a-eae6-4dd7-9cad-827016be8cff.webp','image/webp',243518,0,'2026-04-02 22:36:59'),(10,20,'e15aacb6-8bcf-49f2-b7cb-114b3623e228.webp','/media/products/e15aacb6-8bcf-49f2-b7cb-114b3623e228.webp','image/webp',33808,1,'2026-04-02 23:33:27'),(11,23,'9c9e30de-86ab-4d41-8e25-a0130b5b56fe.webp','/media/products/9c9e30de-86ab-4d41-8e25-a0130b5b56fe.webp','image/webp',15628,1,'2026-04-02 23:36:20'),(12,14,'2f783e96-dbb2-40d1-92a1-86f23a116010.webp','/media/products/2f783e96-dbb2-40d1-92a1-86f23a116010.webp','image/webp',12746,0,'2026-04-03 00:14:28'),(13,14,'f8f54b8b-2e0f-42d1-adbe-d44801f46dc8.webp','/media/products/f8f54b8b-2e0f-42d1-adbe-d44801f46dc8.webp','image/webp',243518,1,'2026-04-03 00:14:35'),(14,33,'a24066f3-02d3-402a-8faa-b18b99644325.webp','/media/products/a24066f3-02d3-402a-8faa-b18b99644325.webp','image/webp',40388,1,'2026-04-03 09:58:00'),(15,34,'99a32ecc-9b7b-4b18-b246-9f974b6ad556.webp','/media/products/99a32ecc-9b7b-4b18-b246-9f974b6ad556.webp','image/webp',20642,1,'2026-04-03 10:00:44'),(16,35,'eada28b0-e8e3-42d4-b07c-c6d62625d77b.webp','/media/products/eada28b0-e8e3-42d4-b07c-c6d62625d77b.webp','image/webp',223592,1,'2026-04-03 10:03:33'),(17,36,'7e8fec07-c691-4e4e-bbda-cbbcd4905261.jpg','/media/products/7e8fec07-c691-4e4e-bbda-cbbcd4905261.jpg','image/jpeg',40472,1,'2026-04-07 08:48:05'),(18,38,'c696ce6c-34af-412e-9b60-647f49de9e59.jpg','/media/products/c696ce6c-34af-412e-9b60-647f49de9e59.jpg','image/jpeg',54695,1,'2026-04-07 09:16:59');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
REPLACE INTO `products` (`id`, `name`, `brand`, `barcode`, `category`, `sale_mode`, `base_unit`, `presentation_value`, `presentation_unit`, `sale_price`, `cost_price`, `stock`, `min_stock`, `is_active`, `created_at`, `updated_at`) VALUES (2,'Pan Tostado Clasico','Bimbo',NULL,'Panaderia','UNIT','piece',210.00,'g',34.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(3,'Pan Tostado DobleFibra','Bimbo',NULL,'Panaderia','UNIT','piece',250.00,'g',36.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(4,'Pan Molido Clasico','Bimbo',NULL,'Panaderia','UNIT','piece',252.00,'g',28.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(5,'Pan Molido Empanizador Crujiente','Bimbo',NULL,'Panaderia','UNIT','piece',175.00,'g',28.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(6,'Pan Bimbo Blanco','Bimbo',NULL,'Panaderia','UNIT','piece',620.00,'g',49.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(7,'Pan Bimbo Blanco Chico','Bimbo',NULL,'Panaderia','UNIT','piece',300.00,'g',25.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(8,'Pan Bimbo Integral','Bimbo',NULL,'Panaderia','UNIT','piece',620.00,'g',52.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(9,'Pan Bimbo Integral Chico','Bimbo',NULL,'Panaderia','UNIT','piece',300.00,'g',28.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(10,'Medias Noches Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',340.00,'g',46.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(11,'Panque con Nuez Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',280.00,'g',42.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(12,'Panque con Marmol Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',280.00,'g',42.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(13,'Panque con Pasas Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',280.00,'g',42.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(14,'Colchones Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',130.00,'g',16.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(15,'Roles con canela Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',180.00,'g',25.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(16,'Mantecadas con chispas sabor a chocolate Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',190.00,'g',32.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(17,'Mantecadas sabor vainilla Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',180.00,'g',32.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(18,'Mantecadas sabor Marmol','Bimbo',NULL,'Panaderia','UNIT','piece',187.50,'g',32.00,NULL,4.000,0.000,1,'2026-04-02 21:00:21','2026-04-03 10:20:39'),(19,'Mantecadas con nuez Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',184.50,'g',32.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(20,'Donas Bimbo','Bimbo','7501030474227','Panaderia','UNIT','piece',158.00,'g',22.00,NULL,4.000,0.000,1,'2026-04-02 21:00:21','2026-04-07 08:47:04'),(21,'Rebanadas Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',55.00,'g',8.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(22,'Bimbuñuelos Bimbo','Bimbo','7501030472698','Panaderia','UNIT','piece',99.00,'g',22.00,NULL,1.000,0.000,1,'2026-04-02 21:00:21','2026-04-08 20:36:26'),(23,'Madalenas 3 pz Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',93.00,'g',20.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(24,'Bran Frut Fresa/Piña Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',58.00,'g',12.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(25,'Nito Bimbo','Bimbo',NULL,'Panaderia','UNIT','piece',62.00,'g',17.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(26,'Nido Duo','Bimbo',NULL,'Panaderia','UNIT','piece',124.00,'g',28.00,NULL,0.000,0.000,1,'2026-04-02 21:00:21','2026-04-02 21:00:21'),(33,'Jamon','Kir',NULL,'Carniceria','WEIGHT','kg',NULL,NULL,115.00,90.00,4000.000,500.000,1,'2026-04-03 09:58:00','2026-04-03 09:58:00'),(34,'Jitomate','X',NULL,'Fruteria','WEIGHT','kg',NULL,NULL,58.00,35.00,1200.000,200.000,1,'2026-04-03 10:00:44','2026-04-07 09:31:56'),(35,'Hi Dog - Adulto','Hi Dog',NULL,'Croqueta','WEIGHT','kg',NULL,NULL,35.00,22.00,25000.000,2000.000,1,'2026-04-03 10:03:33','2026-04-03 10:03:33'),(36,'Caldo de pollo','Knorr','7501005180306','Alimento','UNIT','piece',10.50,'g',6.00,4.00,3.000,0.000,1,'2026-04-07 08:47:04','2026-04-07 09:15:05'),(37,'Mazapan','de la Rosa','724869007214','Dulce','UNIT','piece',NULL,NULL,6.00,4.00,6.000,0.000,1,'2026-04-07 08:47:04','2026-04-07 09:04:54'),(38,'Burst agua purificada','burst',NULL,'Bebida','UNIT','piece',1.50,'L',17.00,14.00,10.000,0.000,1,'2026-04-07 09:16:59','2026-04-07 09:16:59');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `purchase_items`
--

LOCK TABLES `purchase_items` WRITE;
/*!40000 ALTER TABLE `purchase_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
REPLACE INTO `sale_items` (`id`, `sale_id`, `product_id`, `quantity`, `unit_price`, `subtotal`, `created_at`) VALUES (1,1,18,1.000,32.00,32.00,'2026-04-03 10:20:39'),(2,1,22,2.000,22.00,44.00,'2026-04-03 10:20:39'),(3,2,22,1.000,22.00,22.00,'2026-04-07 09:46:41'),(4,3,22,1.000,22.00,22.00,'2026-04-07 09:48:35'),(5,4,22,4.000,22.00,88.00,'2026-04-07 10:23:38'),(6,5,22,1.000,22.00,22.00,'2026-04-08 20:36:26');
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
REPLACE INTO `sales` (`id`, `total`, `payment_method`, `status`, `synced`, `user_id`, `created_at`) VALUES (1,76.00,'CASH','COMPLETED',0,NULL,'2026-04-03 10:20:39'),(2,22.00,'CASH','COMPLETED',0,NULL,'2026-04-07 09:46:41'),(3,22.00,'CASH','COMPLETED',0,NULL,'2026-04-07 09:48:35'),(4,88.00,'CASH','COMPLETED',0,1,'2026-04-07 10:23:38'),(5,22.00,'CASH','COMPLETED',0,1,'2026-04-08 20:36:26');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
REPLACE INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `reference_table`, `reference_id`, `notes`, `created_at`) VALUES (1,18,'SALE_OUT',1.000,'sale_items',1,'Salida por venta','2026-04-03 10:20:39'),(2,22,'SALE_OUT',2.000,'sale_items',2,'Salida por venta','2026-04-03 10:20:39'),(3,22,'SALE_OUT',1.000,'sale_items',3,'Salida por venta','2026-04-07 09:46:41'),(4,22,'SALE_OUT',1.000,'sale_items',4,'Salida por venta','2026-04-07 09:48:35'),(5,22,'SALE_OUT',4.000,'sale_items',5,'Salida por venta','2026-04-07 10:23:38'),(6,22,'SALE_OUT',1.000,'sale_items',6,'Salida por venta','2026-04-08 20:36:26');
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `supplier_products`
--

LOCK TABLES `supplier_products` WRITE;
/*!40000 ALTER TABLE `supplier_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `supplier_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `supplier_visits`
--

LOCK TABLES `supplier_visits` WRITE;
/*!40000 ALTER TABLE `supplier_visits` DISABLE KEYS */;
REPLACE INTO `supplier_visits` (`id`, `supplier_id`, `visit_date`, `expected_amount`, `status`, `notes`, `created_at`, `updated_at`) VALUES (1,1,'2026-04-04',1800.00,'PAID',NULL,'2026-04-03 10:19:09','2026-04-08 20:38:48'),(2,1,'2026-04-04',200.00,'PAID',NULL,'2026-04-03 10:19:24','2026-04-08 20:38:53');
/*!40000 ALTER TABLE `supplier_visits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
REPLACE INTO `suppliers` (`id`, `name`, `contact_name`, `phone`, `email`, `address`, `notes`, `visit_days_json`, `visit_frequency`, `is_active`, `created_at`, `updated_at`) VALUES (1,'Cocacola','Visita','7775849309',NULL,NULL,NULL,NULL,'WEEKLY',1,'2026-04-03 10:18:31','2026-04-03 10:18:31'),(2,'x','jarrito','798790879',NULL,NULL,NULL,'[\"MON\",\"TUE\",\"SUN\"]','WEEKLY',1,'2026-04-08 22:01:18','2026-04-08 22:01:18');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sync_logs`
--

LOCK TABLES `sync_logs` WRITE;
/*!40000 ALTER TABLE `sync_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
REPLACE INTO `users` (`id`, `username`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`, `is_admin`) VALUES (1,'admin','12345678','ADMIN',1,'2026-04-02 20:26:55','2026-04-07 10:10:11',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-08 22:31:35
