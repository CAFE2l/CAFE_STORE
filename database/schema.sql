CREATE DATABASE IF NOT EXISTS cafe_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cafe_store;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  google_id VARCHAR(191) NULL UNIQUE,
  auth_provider ENUM('password', 'google') NOT NULL DEFAULT 'password',
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  avatar_url VARCHAR(500) NULL,
  bio TEXT NULL,
  last_seen_at TIMESTAMP NULL DEFAULT NULL,
  password_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  short_description VARCHAR(255) NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  old_price DECIMAL(10,2) NULL,
  category_id INT UNSIGNED NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  is_digital TINYINT(1) NOT NULL DEFAULT 1,
  image_url VARCHAR(500) NULL,
  main_image_url VARCHAR(500) NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'digital',
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  public_id VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cart_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  session_id VARCHAR(128) NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('pending','processing','paid','shipped','completed','cancelled','created') NOT NULL DEFAULT 'pending',
  payment_status ENUM('pending','approved','rejected','cancelled','refunded','paid','failed') NOT NULL DEFAULT 'pending',
  payment_method ENUM('pix','mercadopago','paypal','card','mock') NOT NULL DEFAULT 'pix',
  customer_name VARCHAR(120) NULL,
  customer_email VARCHAR(160) NULL,
  customer_phone VARCHAR(40) NULL,
  shipping_address TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  product_name VARCHAR(160) NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NULL,
  payment_method VARCHAR(40) NOT NULL DEFAULT 'pix',
  payment_provider VARCHAR(60) NULL,
  provider VARCHAR(60) NOT NULL,
  provider_payment_id VARCHAR(160) NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  status ENUM('pending','approved','rejected','cancelled','refunded','paid','failed') NOT NULL DEFAULT 'pending',
  pix_qr_code TEXT NULL,
  pix_copy_paste TEXT NULL,
  paypal_order_id VARCHAR(160) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  order_id INT UNSIGNED NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product_review (product_id, user_id),
  CONSTRAINT fk_product_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE review_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  review_id INT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  public_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_images_review FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE client_feedbacks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  client_name VARCHAR(120) NOT NULL,
  role_company VARCHAR(180) NULL,
  project_name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  project_summary TEXT NULL,
  results TEXT NULL,
  feedback_text TEXT NOT NULL,
  story_steps TEXT NULL,
  stack_used VARCHAR(255) NULL,
  media_json JSON NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_client_feedbacks_status (status),
  KEY idx_client_feedbacks_user (user_id),
  CONSTRAINT fk_client_feedbacks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE favorites (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, product_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE addresses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  label VARCHAR(80) NULL,
  recipient_name VARCHAR(120) NULL,
  phone VARCHAR(40) NULL,
  address_line VARCHAR(255) NOT NULL,
  city VARCHAR(120) NULL,
  state VARCHAR(80) NULL,
  postal_code VARCHAR(40) NULL,
  country VARCHAR(80) NOT NULL DEFAULT 'Brasil',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE coupons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  discount_type ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  starts_at TIMESTAMP NULL DEFAULT NULL,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_coupons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  coupon_id INT UNSIGNED NOT NULL,
  status ENUM('active','used','expired') NOT NULL DEFAULT 'active',
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY unique_user_coupon (user_id, coupon_id),
  CONSTRAINT fk_user_coupons_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_coupons_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_reviews_product_status ON product_reviews(product_id, status);

INSERT INTO categories (name, slug) VALUES
('Camisetas', 'camisetas'),
('Acessórios', 'acessorios'),
('Chaveiros', 'chaveiros'),
('Canecas', 'canecas'),
('Moletons', 'moletons');

-- Senha inicial do admin: password
INSERT INTO users (name, email, password_hash, role, password_updated_at) VALUES
('Admin CAFÉ', 'admin@cafestore.local', '$2y$10$Mm16PR/2mCkMRBAqoc09ROGiam4ffgLuMIAK2L7tJsQFGhPbUnNte', 'admin', NOW());

INSERT INTO products (category_id, name, slug, description, short_description, price, old_price, image_url, main_image_url, stock, type, is_digital, status) VALUES
(1, 'Camiseta CAFÉ STORE Support', 'camiseta-cafe-store-support', 'Camiseta simbólica da CAFÉ STORE para quem quer apoiar o projeto e representar a marca. Este item funciona como apoio/donate; produção e entrega física dependem de campanha confirmada.', 'Camiseta simbólica para apoiar a CAFÉ STORE.', 59.90, NULL, '', '', 50, 'camiseta', 1, 'active'),
(2, 'Kit de acessórios CAFÉ', 'kit-de-acessorios-cafe', 'Kit simbólico de acessórios da marca CAFÉ para apoiadores: adesivos, bottons e itens de comunidade. O valor representa apoio ao projeto.', 'Acessórios simbólicos para apoiadores.', 39.90, NULL, '', '', 80, 'acessorio', 1, 'active'),
(3, 'Chaveiro Flame CAFÉ', 'chaveiro-flame-cafe', 'Chaveiro simbólico com identidade da CAFÉ STORE para quem quer apoiar o projeto. Campanhas físicas serão comunicadas separadamente.', 'Chaveiro simbólico da marca CAFÉ.', 19.90, NULL, '', '', 120, 'chaveiro', 1, 'active'),
(4, 'Caneca CAFÉ STORE', 'caneca-cafe-store', 'Caneca simbólica da CAFÉ STORE para apoiadores da marca. Este item representa apoio/donate enquanto a produção oficial não estiver ativa.', 'Caneca simbólica para apoiar a marca.', 44.90, NULL, '', '', 60, 'caneca', 1, 'active'),
(5, 'Moletom CAFÉ STORE Support', 'moletom-cafe-store-support', 'Moletom simbólico da CAFÉ STORE para apoiadores. Compra registrada como apoio ao projeto, com entrega física apenas quando houver campanha oficial.', 'Moletom simbólico para apoiadores.', 119.90, NULL, '', '', 30, 'moletom', 1, 'active');

INSERT INTO coupons (code, title, description, discount_type, discount_value, status) VALUES
('CAFE10', '10% no próximo apoio', 'Cupom ativo para apoiar produtos CAFÉ STORE.', 'percent', 10.00, 'active'),
('STARTUP15', '15% para comunidade', 'Benefício para devs, startups e networking.', 'percent', 15.00, 'active'),
('FRETECAFE', 'Ajuda na entrega', 'Cupom reservado para quando a entrega física estiver ativa.', 'fixed', 12.00, 'active');
