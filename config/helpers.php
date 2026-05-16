<?php
/**
 * CAFÉ STORE - Helper Functions
 * Funções auxiliares para o projeto
 */

// Iniciar sessão se não estiver iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

if (!defined('APP_NAME')) {
    define('APP_NAME', 'CAFÉ STORE');
}

if (!defined('BASE_URL')) {
    define('BASE_URL', '/');
}

if (!defined('GOOGLE_CLIENT_ID')) {
    define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: '');
}

if (!defined('GOOGLE_CLIENT_SECRET')) {
    define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '');
}

if (!defined('MERCADOPAGO_ACCESS_TOKEN')) {
    define('MERCADOPAGO_ACCESS_TOKEN', getenv('MERCADOPAGO_ACCESS_TOKEN') ?: '');
}

if (!defined('PAYPAL_CLIENT_ID')) {
    define('PAYPAL_CLIENT_ID', getenv('PAYPAL_CLIENT_ID') ?: '');
}

if (!defined('PAYPAL_CLIENT_SECRET')) {
    define('PAYPAL_CLIENT_SECRET', getenv('PAYPAL_CLIENT_SECRET') ?: '');
}

/**
 * Conexão com banco de dados
 */
function db() {
    static $pdo = null;
    
    if ($pdo === null) {
        $host = 'db';  // Nome do serviço no Docker
        $db   = 'cafe_store';
        $user = 'root';
        $pass = 'root123';
        $charset = 'utf8mb4';
        
        $dsn = "mysql:host={$host};dbname={$db};charset={$charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        try {
            $pdo = new PDO($dsn, $user, $pass, $options);
            ensure_app_schema($pdo);
        } catch (PDOException $e) {
            error_log("Erro de conexão PDO: " . $e->getMessage());
            die("Erro ao conectar com o banco de dados.");
        }
    }
    
    return $pdo;
}

/**
 * Gerar URL amigável
 */
function url($path = '') {
    return rtrim(BASE_URL, '/') . '/' . ltrim($path, '/');
}

/**
 * Gerar URL absoluta
 */
function absolute_url($path = '') {
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $scheme = $https ? 'https' : 'http';

    return $scheme . '://' . $host . url($path);
}

/**
 * Escapar HTML para segurança (XSS protection)
 */
function e($string) {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Formatar valor monetário
 */
function money($value) {
    return 'R$ ' . number_format((float) $value, 2, ',', '.');
}

/**
 * Resumir texto
 */
function excerpt($text, $length = 90) {
    $text = strip_tags($text ?? '');
    if (mb_strlen($text) > $length) {
        return mb_substr($text, 0, $length) . '...';
    }
    return $text;
}

function slugify($text) {
    $text = iconv('UTF-8', 'ASCII//TRANSLIT', (string) $text) ?: (string) $text;
    $text = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $text) ?? '');
    return trim($text, '-') ?: 'produto';
}

/**
 * Gerar URL de imagem (Cloudinary ou local)
 */
function product_image($image_url) {
    if (empty($image_url)) {
        return url('assets/images/mascot.svg');
    }

    if (basename((string) $image_url) === 'placeholder.png') {
        return url('assets/images/mascot.svg');
    }
    
    // Se já é URL completa (Cloudinary)
    if (strpos($image_url, 'http') === 0) {
        return $image_url;
    }
    
    // Se é caminho relativo
    return url($image_url);
}

function product_main_image(array $product) {
    return product_image($product['main_image_url'] ?? $product['image_url'] ?? '');
}

function normalize_payment_method($method) {
    $method = (string) $method;
    return in_array($method, ['pix', 'mercadopago', 'paypal'], true) ? $method : '';
}

/**
 * Verificar se usuário está logado
 */
function is_logged_in() {
    return isset($_SESSION['user_id']);
}

/**
 * Exigir usuário autenticado
 */
function require_login() {
    if (!current_user()) {
        flash('error', 'Faça login para continuar.');
        redirect('login.php');
    }
}

/**
 * Exigir usuário administrador
 */
function require_admin() {
    $user = current_user();
    if (!$user || ($user['role'] ?? '') !== 'admin') {
        http_response_code(403);
        exit('Acesso negado.');
    }
}

/**
 * Redirecionar
 */
function redirect($url) {
    header("Location: " . url($url));
    exit;
}

/**
 * Gerar token CSRF
 */
function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verificar token CSRF
 */
function verify_csrf_token($token) {
    return hash_equals($_SESSION['csrf_token'] ?? '', $token ?? '');
}

function require_post() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        exit('Método não permitido.');
    }
}

/**
 * Debug helper
 */
function dd($data) {
    echo '<pre>';
    var_dump($data);
    echo '</pre>';
    die();
}


/**
 * Retorna os dados do usuário logado ou null
 */
function current_user() {
    // Se não estiver logado, retorna null
    if (!is_logged_in()) {
        return null;
    }

    // Cache em sessão para evitar queries repetidas na mesma requisição
    if (isset($_SESSION['user_cache'])) {
        return $_SESSION['user_cache'];
    }

    try {
        $pdo = db();
        $stmt = $pdo->prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $_SESSION['user_cache'] = $user;
        }
        
        return $user;
    } catch (Exception $e) {
        error_log("Erro ao buscar current_user(): " . $e->getMessage());
        return null;
    }
}

/**
 * Retorna a lista de produtos que estão no carrinho (busca do DB)
 */
function cart_products() {
    // Pega o carrinho da sessão (espera formato: ['id_do_produto' => quantidade])
    $cart = $_SESSION['cart'] ?? [];
    if (empty($cart)) return [];

    $pdo = db();
    $ids = array_keys($cart);

    // Cria os placeholders para o SQL (?, ?, ?)
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    
    // Busca os produtos cujos IDs estão no carrinho
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id IN ($placeholders)");
    $stmt->execute($ids);
    $products = $stmt->fetchAll();

    // Adiciona a "quantity" (que vem da sessão) aos dados do produto
    foreach ($products as &$product) {
        $cartItem = $cart[$product['id']] ?? 1;
        $quantity = is_array($cartItem) ? ($cartItem['quantity'] ?? 1) : $cartItem;
        $product['quantity'] = max(1, (int) $quantity);
        $product['line_total'] = (float) $product['price'] * (int) $product['quantity'];
    }

    return $products;
}

/**
 * Calcula o total do carrinho
 */
function cart_total() {
    $products = cart_products();
    $total = 0;
    foreach ($products as $p) {
        $total += (float) $p['price'] * (int) $p['quantity'];
    }
    return $total;
}

/**
 * Retorna a contagem de itens no carrinho (para o badge do header)
 */
function cart_count() {
    $cart = $_SESSION['cart'] ?? [];
    $count = 0;

    foreach ($cart as $item) {
        $count += is_array($item) ? (int) ($item['quantity'] ?? 0) : (int) $item;
    }

    return $count;
}


/**
 * Exibe as mensagens de Flash (Sucesso, Erro, Aviso)
 */
function flashes() {
    $rawMessages = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);

    if (!is_array($rawMessages)) {
        return [];
    }

    $messages = [];
    foreach ($rawMessages as $type => $message) {
        if (is_array($message) && isset($message['type'], $message['message'])) {
            $messages[] = [
                'type' => (string) $message['type'],
                'message' => (string) $message['message'],
            ];
            continue;
        }

        $messages[] = [
            'type' => is_string($type) ? $type : 'info',
            'message' => (string) $message,
        ];
    }

    return $messages;
}

/**
 * Função auxiliar para salvar uma mensagem Flash (para usar no back-end)
 */
function flash($type, $message) {
    $_SESSION['flash'][] = [
        'type' => (string) $type,
        'message' => (string) $message,
    ];
}

function set_flash($type, $message) {
    flash($type, $message);
}

function google_oauth_configured() {
    return GOOGLE_CLIENT_ID !== '' && GOOGLE_CLIENT_SECRET !== '';
}

function google_redirect_uri() {
    return absolute_url('google-callback.php');
}

function google_auth_url($state) {
    return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
        'client_id' => GOOGLE_CLIENT_ID,
        'redirect_uri' => google_redirect_uri(),
        'response_type' => 'code',
        'scope' => 'openid email profile',
        'state' => $state,
        'access_type' => 'online',
        'prompt' => 'select_account',
    ]);
}

function google_http_request($url, $method = 'GET', array $data = []) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
        }
        $body = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($body === false || $error !== '') {
            throw new RuntimeException('Falha na conexão com o Google.');
        }

        $json = json_decode($body, true);
        if (!is_array($json)) {
            throw new RuntimeException('Resposta inválida do Google.');
        }

        return $json;
    }

    $context = null;
    if ($method === 'POST') {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => http_build_query($data),
                'timeout' => 15,
            ],
        ]);
    }

    $body = file_get_contents($url, false, $context);
    if ($body === false) {
        throw new RuntimeException('Falha na conexão com o Google.');
    }

    $json = json_decode($body, true);
    if (!is_array($json)) {
        throw new RuntimeException('Resposta inválida do Google.');
    }

    return $json;
}

function ensure_google_user_columns() {
    $pdo = db();
    $hasGoogleId = $pdo->query("SHOW COLUMNS FROM users LIKE 'google_id'")->fetch();
    if (!$hasGoogleId) {
        $pdo->exec('ALTER TABLE users ADD COLUMN google_id VARCHAR(191) NULL UNIQUE AFTER password_hash');
    }

    $hasProvider = $pdo->query("SHOW COLUMNS FROM users LIKE 'auth_provider'")->fetch();
    if (!$hasProvider) {
        $pdo->exec("ALTER TABLE users ADD COLUMN auth_provider ENUM('password', 'google') NOT NULL DEFAULT 'password' AFTER google_id");
    }
}

function login_with_google_user(array $profile) {
    ensure_google_user_columns();

    $googleId = (string) ($profile['sub'] ?? '');
    $email = filter_var($profile['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $name = trim((string) ($profile['name'] ?? 'Cliente CAFÉ'));
    $emailVerified = (bool) ($profile['email_verified'] ?? false);

    if ($googleId === '' || !$email || !$emailVerified) {
        throw new RuntimeException('Não foi possível validar sua conta Google.');
    }

    $stmt = db()->prepare('SELECT * FROM users WHERE google_id = ? OR email = ? LIMIT 1');
    $stmt->execute([$googleId, $email]);
    $user = $stmt->fetch();

    if ($user) {
        if (empty($user['google_id'])) {
            $update = db()->prepare("UPDATE users SET google_id = ?, auth_provider = 'google' WHERE id = ?");
            $update->execute([$googleId, (int) $user['id']]);
            $user['google_id'] = $googleId;
            $user['auth_provider'] = 'google';
        }

        return $user;
    }

    $passwordHash = password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT);
    $stmt = db()->prepare("INSERT INTO users (name, email, password_hash, google_id, auth_provider, role) VALUES (?, ?, ?, ?, 'google', 'customer')");
    $stmt->execute([$name ?: 'Cliente CAFÉ', $email, $passwordHash, $googleId]);

    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([(int) db()->lastInsertId()]);

    return $stmt->fetch();
}

function table_exists(PDO $pdo, $table) {
    $stmt = $pdo->query('SHOW TABLES LIKE ' . $pdo->quote($table));
    return (bool) $stmt->fetchColumn();
}

function column_exists(PDO $pdo, $table, $column) {
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', (string) $table);
    $stmt = $pdo->query("SHOW COLUMNS FROM `$table` LIKE " . $pdo->quote($column));
    return (bool) $stmt->fetchColumn();
}

function add_column_if_missing(PDO $pdo, $table, $column, $definition) {
    if (!column_exists($pdo, $table, $column)) {
        $pdo->exec("ALTER TABLE `$table` ADD COLUMN $definition");
    }
}

function ensure_app_schema(PDO $pdo) {
    static $done = false;
    if ($done) {
        return;
    }
    $done = true;

    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
        avatar_url VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    add_column_if_missing($pdo, 'users', 'google_id', "google_id VARCHAR(191) NULL UNIQUE AFTER password_hash");
    add_column_if_missing($pdo, 'users', 'auth_provider', "auth_provider ENUM('password', 'google') NOT NULL DEFAULT 'password' AFTER google_id");
    add_column_if_missing($pdo, 'users', 'avatar_url', "avatar_url VARCHAR(500) NULL AFTER role");
    add_column_if_missing($pdo, 'users', 'updated_at', "updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP");

    $pdo->exec("CREATE TABLE IF NOT EXISTS admins (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        slug VARCHAR(140) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    add_column_if_missing($pdo, 'categories', 'updated_at', "updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP");

    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        category_id INT UNSIGNED NULL,
        name VARCHAR(160) NOT NULL,
        slug VARCHAR(180) NOT NULL UNIQUE,
        description TEXT,
        short_description VARCHAR(255) NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        old_price DECIMAL(10,2) NULL,
        image_url VARCHAR(500) NULL,
        main_image_url VARCHAR(500) NULL,
        stock INT UNSIGNED NOT NULL DEFAULT 0,
        type VARCHAR(40) NOT NULL DEFAULT 'digital',
        is_digital TINYINT(1) NOT NULL DEFAULT 1,
        status VARCHAR(40) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    add_column_if_missing($pdo, 'products', 'short_description', "short_description VARCHAR(255) NULL AFTER description");
    add_column_if_missing($pdo, 'products', 'old_price', "old_price DECIMAL(10,2) NULL AFTER price");
    add_column_if_missing($pdo, 'products', 'main_image_url', "main_image_url VARCHAR(500) NULL AFTER image_url");
    add_column_if_missing($pdo, 'products', 'is_digital', "is_digital TINYINT(1) NOT NULL DEFAULT 1 AFTER type");
    add_column_if_missing($pdo, 'products', 'updated_at', "updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP");

    $pdo->exec("CREATE TABLE IF NOT EXISTS product_images (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id INT UNSIGNED NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        public_id VARCHAR(255) NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS cart_items (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NULL,
        session_id VARCHAR(128) NULL,
        product_id INT UNSIGNED NOT NULL,
        quantity INT UNSIGNED NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_cart_user (user_id),
        KEY idx_cart_session (session_id),
        CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    if (table_exists($pdo, 'orders')) {
        try {
            $pdo->exec("ALTER TABLE orders MODIFY status ENUM('pending','processing','paid','shipped','completed','cancelled','created') NOT NULL DEFAULT 'pending'");
            $pdo->exec("ALTER TABLE orders MODIFY payment_status ENUM('pending','approved','rejected','cancelled','refunded','paid','failed') NOT NULL DEFAULT 'pending'");
            $pdo->exec("ALTER TABLE orders MODIFY payment_method ENUM('pix','mercadopago','paypal','card','mock') NOT NULL DEFAULT 'pix'");
        } catch (Throwable $e) {
            error_log('Schema orders enum migration skipped: ' . $e->getMessage());
        }
    } else {
        $pdo->exec("CREATE TABLE orders (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            status ENUM('pending','processing','paid','shipped','completed','cancelled','created') NOT NULL DEFAULT 'pending',
            payment_status ENUM('pending','approved','rejected','cancelled','refunded','paid','failed') NOT NULL DEFAULT 'pending',
            payment_method ENUM('pix','mercadopago','paypal','card','mock') NOT NULL DEFAULT 'pix',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    }
    add_column_if_missing($pdo, 'orders', 'total_amount', "total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER total");
    add_column_if_missing($pdo, 'orders', 'customer_name', "customer_name VARCHAR(120) NULL AFTER payment_method");
    add_column_if_missing($pdo, 'orders', 'customer_email', "customer_email VARCHAR(160) NULL AFTER customer_name");
    add_column_if_missing($pdo, 'orders', 'customer_phone', "customer_phone VARCHAR(40) NULL AFTER customer_email");
    add_column_if_missing($pdo, 'orders', 'shipping_address', "shipping_address TEXT NULL AFTER customer_phone");
    add_column_if_missing($pdo, 'orders', 'updated_at', "updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP");

    $pdo->exec("CREATE TABLE IF NOT EXISTS order_items (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    add_column_if_missing($pdo, 'order_items', 'product_name', "product_name VARCHAR(160) NULL AFTER product_id");
    add_column_if_missing($pdo, 'order_items', 'unit_price', "unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER price");
    add_column_if_missing($pdo, 'order_items', 'total_price', "total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER unit_price");
    add_column_if_missing($pdo, 'order_items', 'created_at', "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

    if (table_exists($pdo, 'payments')) {
        try {
            $pdo->exec("ALTER TABLE payments MODIFY status ENUM('pending','approved','rejected','cancelled','refunded','paid','failed') NOT NULL DEFAULT 'pending'");
        } catch (Throwable $e) {
            error_log('Schema payments enum migration skipped: ' . $e->getMessage());
        }
    } else {
        $pdo->exec("CREATE TABLE payments (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            order_id INT UNSIGNED NOT NULL,
            provider VARCHAR(60) NOT NULL,
            provider_payment_id VARCHAR(160) NULL,
            status ENUM('pending','approved','rejected','cancelled','refunded','paid','failed') NOT NULL DEFAULT 'pending',
            amount DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    }
    add_column_if_missing($pdo, 'payments', 'user_id', "user_id INT UNSIGNED NULL AFTER order_id");
    add_column_if_missing($pdo, 'payments', 'payment_method', "payment_method VARCHAR(40) NOT NULL DEFAULT 'pix' AFTER user_id");
    add_column_if_missing($pdo, 'payments', 'payment_provider', "payment_provider VARCHAR(60) NULL AFTER payment_method");
    add_column_if_missing($pdo, 'payments', 'currency', "currency CHAR(3) NOT NULL DEFAULT 'BRL' AFTER amount");
    add_column_if_missing($pdo, 'payments', 'pix_qr_code', "pix_qr_code TEXT NULL AFTER status");
    add_column_if_missing($pdo, 'payments', 'pix_copy_paste', "pix_copy_paste TEXT NULL AFTER pix_qr_code");
    add_column_if_missing($pdo, 'payments', 'paypal_order_id', "paypal_order_id VARCHAR(160) NULL AFTER pix_copy_paste");
    add_column_if_missing($pdo, 'payments', 'updated_at', "updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP");

    $pdo->exec("CREATE TABLE IF NOT EXISTS product_reviews (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS review_images (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        review_id INT UNSIGNED NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        public_id VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_review_images_review FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS favorites (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        product_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_favorite (user_id, product_id),
        CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_favorites_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS addresses (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}
