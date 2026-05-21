-- MySQL dump 10.13  Distrib 5.7.44, for Linux (x86_64)
--
-- Host: localhost    Database: cafe_store
-- ------------------------------------------------------
-- Server version	5.7.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addresses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `label` varchar(80) DEFAULT NULL,
  `recipient_name` varchar(120) DEFAULT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `address_line` varchar(255) NOT NULL,
  `city` varchar(120) DEFAULT NULL,
  `state` varchar(80) DEFAULT NULL,
  `postal_code` varchar(40) DEFAULT NULL,
  `country` varchar(80) NOT NULL DEFAULT 'Brasil',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_addresses_user` (`user_id`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admins` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_admins_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cart_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `session_id` varchar(128) DEFAULT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `quantity` int(10) unsigned NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cart_user` (`user_id`),
  KEY `idx_cart_session` (`session_id`),
  KEY `fk_cart_items_product` (`product_id`),
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=650 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Overlays OBS','overlays-obs','2026-05-16 13:53:58',NULL),(2,'Templates','templates','2026-05-16 13:53:58',NULL),(3,'Wallpapers','wallpapers','2026-05-16 13:53:58',NULL),(4,'Packs de Ícones','packs-de-icones','2026-05-16 13:53:58','2026-05-17 16:57:41'),(5,'Sites','sites','2026-05-18 16:50:44',NULL),(7,'Landing pages','landing-pages','2026-05-18 16:50:44',NULL),(9,'Vídeos curtos','videos-curtos','2026-05-18 16:50:45',NULL),(10,'Vídeos longos','videos-longos','2026-05-18 16:50:45',NULL),(12,'Web aplicações','web-aplicacoes','2026-05-18 16:50:45',NULL),(315,'Camisetas','camisetas','2026-05-18 18:13:47',NULL),(316,'Acessórios','acessorios','2026-05-18 18:13:47',NULL),(317,'Chaveiros','chaveiros','2026-05-18 18:13:47',NULL),(318,'Canecas','canecas','2026-05-18 18:13:47',NULL),(319,'Moletons','moletons','2026-05-18 18:13:47',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_feedbacks`
--

DROP TABLE IF EXISTS `client_feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_feedbacks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `rating` tinyint(3) unsigned NOT NULL DEFAULT '5',
  `client_name` varchar(120) NOT NULL,
  `role_company` varchar(180) DEFAULT NULL,
  `project_name` varchar(160) NOT NULL,
  `category` varchar(80) NOT NULL,
  `project_summary` text,
  `results` text,
  `feedback_text` text NOT NULL,
  `story_steps` text,
  `stack_used` varchar(255) DEFAULT NULL,
  `media_json` json DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_client_feedbacks_status` (`status`),
  KEY `idx_client_feedbacks_user` (`user_id`),
  CONSTRAINT `fk_client_feedbacks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_feedbacks`
--

LOCK TABLES `client_feedbacks` WRITE;
/*!40000 ALTER TABLE `client_feedbacks` DISABLE KEYS */;
INSERT INTO `client_feedbacks` VALUES (2,3,5,'Gabriel Felipe','Founder','CAFÉ STORE','SaaS','Criamos uma landing estilizada e responsiva com a implementação da loja online ou SaaS desenvolvido inteiramente em live no Youtube','Site mais rápido e maior identidade profissional','Maior Credibilidade para meu negócio','1. Cheguei com uma ideia\r\n2. fizemos a documentação \r\n3. arquitetamos a landing page e lançamos \r\n4. estruturamos o site e fizemos o deploy','php 8, mysql, cloudinary, tailwind, html, css, js, firebase e google cloud para autentição','[{\"url\": \"assets/uploads/feedbacks/feedback-3-668473c4895b.png\", \"name\": \"banner.png\", \"type\": \"image\"}]','approved','2026-05-18 18:08:20',NULL);
/*!40000 ALTER TABLE `client_feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coupons` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(40) NOT NULL,
  `title` varchar(120) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discount_type` enum('percent','fixed') NOT NULL DEFAULT 'percent',
  `discount_value` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=226 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'CAFE10','10% no próximo apoio','Cupom ativo para apoiar produtos CAFÉ STORE.','percent',10.00,'active',NULL,NULL,'2026-05-18 19:07:34',NULL),(2,'STARTUP15','15% para comunidade','Benefício para devs, startups e networking.','percent',15.00,'active',NULL,NULL,'2026-05-18 19:07:34',NULL),(3,'FRETECAFE','Ajuda na entrega','Cupom reservado para quando a entrega física estiver ativa.','fixed',12.00,'active',NULL,NULL,'2026-05-18 19:07:34',NULL);
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favorites` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorite` (`user_id`,`product_id`),
  KEY `fk_favorites_product` (`product_id`),
  CONSTRAINT `fk_favorites_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (1,3,308,'2026-05-18 19:14:19'),(2,3,309,'2026-05-18 19:14:22');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `product_name` varchar(160) DEFAULT NULL,
  `quantity` int(10) unsigned NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,'Overlay Flame Stream Pack',1,49.90,49.90,49.90,'2026-05-16 15:07:54'),(2,2,2,'Template Social CAFÃ‰ Drop',1,34.90,34.90,34.90,'2026-05-16 16:03:36'),(3,3,307,'Chaveiro Flame CAFÉ',1,19.90,19.90,19.90,'2026-05-18 18:16:37'),(4,4,306,'Kit de acessórios CAFÉ',1,39.90,39.90,39.90,'2026-05-18 19:13:21'),(5,5,306,'Kit de acessórios CAFÉ',1,39.90,39.90,39.90,'2026-05-19 16:23:44');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('pending','processing','paid','shipped','completed','cancelled','created') NOT NULL DEFAULT 'pending',
  `payment_status` enum('pending','approved','rejected','cancelled','refunded','paid','failed') NOT NULL DEFAULT 'pending',
  `payment_method` enum('pix','mercadopago','paypal','card','mock') NOT NULL DEFAULT 'pix',
  `customer_name` varchar(120) DEFAULT NULL,
  `customer_email` varchar(160) DEFAULT NULL,
  `customer_phone` varchar(40) DEFAULT NULL,
  `shipping_address` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,49.90,49.90,'pending','pending','pix','Admin CAFÃ‰','admin@cafestore.local',NULL,NULL,'2026-05-16 15:07:54',NULL),(2,2,34.90,34.90,'pending','pending','pix','teste','gutiajs@gmail.com',NULL,NULL,'2026-05-16 16:03:36',NULL),(3,3,19.90,19.90,'pending','pending','pix','Gabriel Felipe','abbass11king11duolingo@gmail.com',NULL,NULL,'2026-05-18 18:16:37',NULL),(4,3,39.90,39.90,'pending','pending','pix','Gabriel Felipe','abbass11king11duolingo@gmail.com',NULL,NULL,'2026-05-18 19:13:21',NULL),(5,3,39.90,39.90,'pending','pending','pix','Gabriel Felipe','abbass11king11duolingo@gmail.com',NULL,NULL,'2026-05-19 16:23:44',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `payment_method` varchar(40) NOT NULL DEFAULT 'pix',
  `payment_provider` varchar(60) DEFAULT NULL,
  `provider` varchar(60) NOT NULL,
  `provider_payment_id` varchar(160) DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled','refunded','paid','failed') NOT NULL DEFAULT 'pending',
  `pix_qr_code` text,
  `pix_copy_paste` text,
  `paypal_order_id` varchar(160) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'BRL',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,1,'pix','pix_mock','pix_mock','mock-1','pending',NULL,'PIX-MOCK-ORDER-1',NULL,49.90,'BRL','2026-05-16 15:07:54',NULL),(2,2,2,'pix','pix_mock','pix_mock','mock-2','pending',NULL,'PIX-MOCK-ORDER-2',NULL,34.90,'BRL','2026-05-16 16:03:36',NULL),(3,3,3,'pix','pix_mock','pix_mock','mock-3','pending',NULL,'PIX-MOCK-ORDER-3',NULL,19.90,'BRL','2026-05-18 18:16:37',NULL),(4,4,3,'pix','pix_static_br_code','pix_static_br_code','pix-4','pending',NULL,'00020126780014br.gov.bcb.pix0136e34f126a-f9ed-43ef-a330-24e44a59b6b40216Apoio Cafe Store520400005303986540539.905802BR5910CAFE STORE6008CURITIBA62140510CAFESTORE3630457B0',NULL,39.90,'BRL','2026-05-18 19:13:21',NULL),(5,5,3,'pix','pix_static_br_code','pix_static_br_code','pix-5','pending',NULL,'00020126780014br.gov.bcb.pix0136e34f126a-f9ed-43ef-a330-24e44a59b6b40216Apoio Cafe Store520400005303986540539.905802BR5910CAFE STORE6008CURITIBA62140510CAFESTORE3630457B0',NULL,39.90,'BRL','2026-05-19 16:23:44',NULL);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_images` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `public_id` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=755 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (743,555,'assets/images/produtos/camisa_normal/preta/camisaVtirine.png',NULL,0,'2026-05-20 18:55:07'),(744,555,'assets/images/produtos/camisa_normal/preta/camisa_tras.png',NULL,1,'2026-05-20 18:55:07'),(745,555,'assets/images/produtos/camisa_normal/preta/banner.png',NULL,2,'2026-05-20 18:55:07'),(746,629,'assets/images/produtos/poliester/preta/camisa_poliester.png',NULL,0,'2026-05-20 18:55:07'),(747,629,'assets/images/produtos/poliester/preta/frente.jpeg',NULL,1,'2026-05-20 18:55:07'),(748,629,'assets/images/produtos/poliester/preta/tras.png',NULL,2,'2026-05-20 18:55:07'),(749,307,'assets/images/produtos/chaveiro/frente.png',NULL,0,'2026-05-20 18:55:07'),(750,307,'assets/images/produtos/chaveiro/verso.png',NULL,1,'2026-05-20 18:55:07'),(751,308,'assets/images/produtos/caneca/preta/frente.png',NULL,0,'2026-05-20 18:55:08'),(752,308,'assets/images/produtos/caneca/preta/tras.png',NULL,1,'2026-05-20 18:55:08'),(753,308,'assets/images/produtos/caneca/preta/banner.png',NULL,2,'2026-05-20 18:55:08'),(754,309,'assets/images/produtos/moletons/design.png',NULL,0,'2026-05-20 18:55:08');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_reviews` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `order_id` int(10) unsigned DEFAULT NULL,
  `verified_purchase` tinyint(1) NOT NULL DEFAULT '0',
  `rating` tinyint(3) unsigned NOT NULL,
  `comment` text,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_review` (`product_id`,`user_id`),
  KEY `fk_product_reviews_user` (`user_id`),
  KEY `fk_product_reviews_order` (`order_id`),
  CONSTRAINT `fk_product_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (1,1,1,1,1,5,'Teste funcional','pending','2026-05-16 15:08:12','2026-05-20 19:48:01'),(2,309,3,NULL,0,4,'testando aba de comentários','pending','2026-05-18 20:22:09',NULL);
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `short_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `old_price` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `main_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock` int(10) unsigned NOT NULL DEFAULT '0',
  `type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'digital',
  `is_digital` tinyint(1) NOT NULL DEFAULT '1',
  `status` enum('active','draft') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1008 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Overlay Flame Stream Pack','overlay-flame-stream-pack','Pacote visual para lives com telas de início, pausa, encerramento e molduras de webcam.','Pack visual para lives e streams.',49.90,NULL,'',NULL,50,'overlay',1,'draft','2026-05-16 13:53:58','2026-05-18 16:50:45'),(2,2,'Template Social CAFÉ Drop','template-social-cafe-drop','Templates editáveis para posts de lançamento, anúncios e banners rápidos.','Templates editáveis para lançamentos.',34.90,NULL,'',NULL,80,'template',1,'draft','2026-05-16 13:53:58','2026-05-18 16:50:45'),(3,3,'Wallpaper Mascote Fire 4K','wallpaper-mascote-fire-4k','Wallpaper em alta resolução com a chama CAFÉ em composição gamer.','Wallpaper 4K da marca CAFÉ.',14.90,NULL,'',NULL,120,'wallpaper',1,'draft','2026-05-16 13:53:58','2026-05-18 16:50:45'),(4,4,'Pack de Ícones Tech Yellow','pack-de-icones-tech-yellow','Conjunto de ícones para canais, servidores e lojas digitais.','Ícones digitais em pacote.',24.90,NULL,'',NULL,100,'pack',1,'draft','2026-05-16 13:53:58','2026-05-18 16:50:45'),(5,5,'Site institucional para negócios','site-institucional-para-negocios','Criação de site responsivo para apresentar empresa, serviços, diferenciais, contato e presença profissional na internet.','Site profissional para apresentar seu negócio online.',899.90,NULL,'','',10,'site',1,'draft','2026-05-18 16:51:12','2026-05-18 18:13:47'),(6,7,'Landing page de alta conversão','landing-page-de-alta-conversao','Página focada em uma oferta específica, com estrutura para campanha, captura de leads, lançamento ou venda direta.','Landing page para campanhas, leads e vendas.',499.90,NULL,'','',12,'landing_page',1,'draft','2026-05-18 16:51:12','2026-05-18 18:13:47'),(7,9,'Vídeo curto para redes sociais','video-curto-para-redes-sociais','Edição de vídeo vertical para Reels, Shorts, TikTok ou anúncios rápidos, com cortes objetivos, ritmo e legendas.','Vídeo curto para redes sociais e anúncios.',149.90,NULL,'','',25,'video_curto',1,'draft','2026-05-18 16:51:12','2026-05-18 18:13:47'),(8,10,'Vídeo longo profissional','video-longo-profissional','Edição de vídeo completo para YouTube, aulas, apresentações ou conteúdo institucional, com organização narrativa e acabamento final.','Vídeo longo para conteúdo, aulas e YouTube.',349.90,NULL,'','',15,'video_longo',1,'draft','2026-05-18 16:51:12','2026-05-18 18:13:47'),(9,12,'Web aplicação para empresas','web-aplicacao-para-empresas','Desenvolvimento de aplicação web com a stack adequada para automatizar processos, vender online, organizar pedidos ou centralizar operações do negócio. Pode envolver React, Vue.js, Next.js, APIs, Cloudinary, Render e outras soluções conforme o projeto.','Sistema web sob escopo para o seu negócio.',1499.90,NULL,'','',6,'web_app',1,'draft','2026-05-18 16:51:12','2026-05-18 18:13:47'),(306,316,'Kit de acessórios CAFÉ','kit-de-acessorios-cafe','Kit simbólico de acessórios da marca CAFÉ para apoiadores: adesivos, bottons e itens de comunidade. O valor representa apoio ao projeto.','Acessórios simbólicos para apoiadores.',39.90,NULL,'','',80,'acessorio',1,'draft','2026-05-18 18:13:47','2026-05-19 20:19:46'),(307,317,'Chaveiro Flame CAFÉ','chaveiro-flame-cafe','Chaveiro simbólico com identidade da CAFÉ STORE para quem quer apoiar o projeto. Campanhas físicas serão comunicadas separadamente.','Chaveiro simbólico da marca CAFÉ.',19.90,NULL,'assets/images/produtos/chaveiro/design.png','assets/images/produtos/chaveiro/design.png',120,'chaveiro',1,'active','2026-05-18 18:13:48','2026-05-20 16:39:26'),(308,318,'Caneca CAFÉ STORE','caneca-cafe-store','Caneca simbólica da CAFÉ STORE para apoiadores da marca. Este item representa apoio/donate enquanto a produção oficial não estiver ativa.','Caneca simbólica para apoiar a marca.',44.90,NULL,'assets/images/produtos/caneca/preta/design.png','assets/images/produtos/caneca/preta/design.png',60,'caneca',1,'active','2026-05-18 18:13:48','2026-05-20 18:26:06'),(309,319,'Moletom CAFÉ STORE Support','moletom-cafe-store-support','Moletom simbólico da CAFÉ STORE para apoiadores. Compra registrada como apoio ao projeto, com entrega física apenas quando houver campanha oficial.','Moletom simbólico para apoiadores.',119.90,NULL,'assets/images/produtos/moletons/design.png','assets/images/produtos/moletons/design.png',30,'moletom',1,'active','2026-05-18 18:13:48','2026-05-19 20:32:38'),(555,315,'Camiseta CAFÉ STORE Limited Edition','camiseta-cafe-store-limited-edition','Camiseta preta limited edition da CAFÉ STORE com estampa premium do mascote flame na frente, ícone na manga, tag personalizada e arte traseira com a frase CREATE BUILD INSPIRE. Malha 100% algodão, toque macio, alta durabilidade e cores vibrantes. Este item funciona como apoio/donate; produção e entrega física dependem de campanha confirmada.','Camiseta preta limited edition com mascote frontal, arte traseira CREATE BUILD INSPIRE, tag personalizada e malha 100% algodão.',79.90,NULL,'assets/images/produtos/camisa_normal/preta/design.jpeg','assets/images/produtos/camisa_normal/preta/design.jpeg',50,'camiseta',1,'active','2026-05-19 19:46:25','2026-05-20 17:38:11'),(629,315,'Camiseta CAFÉ STORE Dry Pro Poliéster','camiseta-cafe-store-dry-pro-poliester','Camiseta performance tech tee em poliéster dry pro com visual preto e laranja, mascote frontal, identidade CAFÉ STORE nas mangas e arte traseira CREATE BUILD INSPIRE. Tecido respirável, secagem rápida, proteção UV, leveza e flexibilidade para quem vive o digital. Este item funciona como apoio/donate; produção e entrega física dependem de campanha confirmada.','Camiseta de poliéster dry pro com visual tech, respirável, secagem rápida, proteção UV e arte CAFÉ STORE.',89.90,NULL,'assets/images/produtos/poliester/preta/design.png','assets/images/produtos/poliester/preta/design.png',50,'camiseta',1,'active','2026-05-19 20:19:46','2026-05-20 17:38:12');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_images`
--

DROP TABLE IF EXISTS `review_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `review_images` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `review_id` int(10) unsigned NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `public_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_review_images_review` (`review_id`),
  CONSTRAINT `fk_review_images_review` FOREIGN KEY (`review_id`) REFERENCES `product_reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_images`
--

LOCK TABLES `review_images` WRITE;
/*!40000 ALTER TABLE `review_images` DISABLE KEYS */;
INSERT INTO `review_images` VALUES (2,2,'assets/uploads/reviews/review-2-28859c6acdf28656.png',NULL,'2026-05-18 20:24:41'),(3,2,'assets/uploads/reviews/review-2-27788f7206fc4709.png',NULL,'2026-05-18 20:42:33');
/*!40000 ALTER TABLE `review_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `rating` tinyint(3) unsigned NOT NULL,
  `comment` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_reviews_user` (`user_id`),
  KEY `fk_reviews_product` (`product_id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_coupons`
--

DROP TABLE IF EXISTS `user_coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_coupons` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `coupon_id` int(10) unsigned NOT NULL,
  `status` enum('active','used','expired') NOT NULL DEFAULT 'active',
  `redeemed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_coupon` (`user_id`,`coupon_id`),
  KEY `fk_user_coupons_coupon` (`coupon_id`),
  CONSTRAINT `fk_user_coupons_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_coupons_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_coupons`
--

LOCK TABLES `user_coupons` WRITE;
/*!40000 ALTER TABLE `user_coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `google_id` varchar(191) DEFAULT NULL,
  `auth_provider` enum('password','google') NOT NULL DEFAULT 'password',
  `role` enum('customer','admin') NOT NULL DEFAULT 'customer',
  `avatar_url` varchar(500) DEFAULT NULL,
  `bio` text,
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `password_updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin CAFÃ‰','admin@cafestore.local','$2y$10$Mm16PR/2mCkMRBAqoc09ROGiam4ffgLuMIAK2L7tJsQFGhPbUnNte',NULL,'password','admin',NULL,NULL,'2026-05-18 20:24:04',NULL,'2026-05-16 13:53:58','2026-05-18 20:24:04'),(2,'teste','gutiajs@gmail.com','$2y$10$WOJ9GhOy9rG70y0xrwb7mOMavYjGB5KSQzeznK.K0Jio8pVo9KPFW','112884426733686675180','google','admin','assets/uploads/avatars/user-2-4be64ebd3519.png','','2026-05-20 20:17:18',NULL,'2026-05-16 14:30:31','2026-05-20 20:17:18'),(3,'Gabriel Felipe','abbass11king11duolingo@gmail.com','$2y$10$ToDxSYc36Mpy34ulf5XPPuKeo3widZ328Smk7YJfXpKuD7/efqX6K','110858260508975849588','google','customer','assets/uploads/avatars/user-3-db9139236606.png','Fundador da CAFÉ STORE','2026-05-20 15:57:45',NULL,'2026-05-18 16:53:52','2026-05-20 15:57:45');
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

-- Dump completed on 2026-05-20 20:21:34
