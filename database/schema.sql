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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  image_url VARCHAR(500),
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  type ENUM('digital', 'overlay', 'template', 'wallpaper', 'pack', 'preset') NOT NULL DEFAULT 'digital',
  status ENUM('active', 'draft') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('created', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'created',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  payment_method ENUM('pix', 'card', 'mock') NOT NULL DEFAULT 'pix',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  provider VARCHAR(60) NOT NULL,
  provider_payment_id VARCHAR(160),
  status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE favorites (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, product_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);

INSERT INTO categories (name, slug) VALUES
('Overlays OBS', 'overlays-obs'),
('Templates', 'templates'),
('Wallpapers', 'wallpapers'),
('Packs gráficos', 'packs-graficos');

-- Senha inicial do admin: password
-- Troque no primeiro acesso ou crie outro admin com password_hash() pelo PHP.
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin CAFÉ', 'admin@cafestore.local', '$2y$10$Mm16PR/2mCkMRBAqoc09ROGiam4ffgLuMIAK2L7tJsQFGhPbUnNte', 'admin');

INSERT INTO products (category_id, name, slug, description, price, image_url, stock, type, status) VALUES
(1, 'Overlay Flame Stream Pack', 'overlay-flame-stream-pack', 'Pacote visual para lives com telas de inicio, pausa, encerramento e molduras de webcam.', 49.90, '', 50, 'overlay', 'active'),
(2, 'Template Social CAFÉ Drop', 'template-social-cafe-drop', 'Templates editáveis para posts de lançamento, anúncios e banners rápidos.', 34.90, '', 80, 'template', 'active'),
(3, 'Wallpaper Mascote Fire 4K', 'wallpaper-mascote-fire-4k', 'Wallpaper em alta resolução com a chama CAFÉ em composição gamer.', 14.90, '', 120, 'wallpaper', 'active'),
(4, 'Pack Ícones Tech Yellow', 'pack-icones-tech-yellow', 'Conjunto de ícones para canais, servidores e lojas digitais.', 24.90, '', 100, 'pack', 'active');
