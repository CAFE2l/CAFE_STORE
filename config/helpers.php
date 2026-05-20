<?php
/**
 * CAFÉ STORE - Helper Functions
 * Funções auxiliares para o projeto
 *
 * SQL manual da Correção 5, se necessário:
 * ALTER TABLE product_reviews ADD COLUMN verified_purchase TINYINT(1) NOT NULL DEFAULT 0 AFTER order_id;
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

if (!defined('WHATSAPP_CONTACT_NUMBER')) {
    define('WHATSAPP_CONTACT_NUMBER', getenv('WHATSAPP_CONTACT_NUMBER') ?: '5541996713782');
}

if (!defined('TELEGRAM_CLIENT_CHANNEL_URL')) {
    define('TELEGRAM_CLIENT_CHANNEL_URL', getenv('TELEGRAM_CLIENT_CHANNEL_URL') ?: 'https://t.me/+5541996713782');
}

if (!defined('DISCORD_COMMUNITY_URL')) {
    define('DISCORD_COMMUNITY_URL', getenv('DISCORD_COMMUNITY_URL') ?: 'https://discord.com/invite/gW2tShPFxf');
}

if (!defined('PIX_KEY')) {
    define('PIX_KEY', getenv('PIX_KEY') ?: 'e34f126a-f9ed-43ef-a330-24e44a59b6b4');
}

if (!defined('PIX_MERCHANT_NAME')) {
    define('PIX_MERCHANT_NAME', getenv('PIX_MERCHANT_NAME') ?: 'CAFE STORE');
}

if (!defined('PIX_MERCHANT_CITY')) {
    define('PIX_MERCHANT_CITY', getenv('PIX_MERCHANT_CITY') ?: 'CURITIBA');
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

function current_request_path() {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    return $uri !== '' ? ltrim($uri, '/') : 'profile.php';
}

function redirect_after_login_path() {
    $path = $_SESSION['intended_url'] ?? 'profile.php';
    unset($_SESSION['intended_url']);
    return is_string($path) && $path !== '' ? $path : 'profile.php';
}

function whatsapp_url($message = '') {
    return 'https://wa.me/' . preg_replace('/\D+/', '', WHATSAPP_CONTACT_NUMBER) . '?' . http_build_query([
        'text' => (string) $message,
    ]);
}

function emv_field($id, $value) {
    $value = (string) $value;
    return str_pad((string) $id, 2, '0', STR_PAD_LEFT)
        . str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT)
        . $value;
}

function pix_crc16($payload) {
    $crc = 0xFFFF;
    $length = strlen($payload);

    for ($i = 0; $i < $length; $i++) {
        $crc ^= ord($payload[$i]) << 8;
        for ($bit = 0; $bit < 8; $bit++) {
            $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) : ($crc << 1);
            $crc &= 0xFFFF;
        }
    }

    return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
}

function pix_br_code($amount, $txid = 'CAFESTORE') {
    $nameSource = function_exists('iconv') ? (iconv('UTF-8', 'ASCII//TRANSLIT', PIX_MERCHANT_NAME) ?: PIX_MERCHANT_NAME) : PIX_MERCHANT_NAME;
    $citySource = function_exists('iconv') ? (iconv('UTF-8', 'ASCII//TRANSLIT', PIX_MERCHANT_CITY) ?: PIX_MERCHANT_CITY) : PIX_MERCHANT_CITY;
    $merchantName = substr(preg_replace('/[^A-Z0-9 ]/', '', strtoupper($nameSource)), 0, 25);
    $merchantCity = substr(preg_replace('/[^A-Z0-9 ]/', '', strtoupper($citySource)), 0, 15);
    $txid = substr(preg_replace('/[^A-Za-z0-9]/', '', (string) $txid), 0, 25) ?: 'CAFESTORE';

    $merchantAccount = emv_field('00', 'br.gov.bcb.pix')
        . emv_field('01', PIX_KEY)
        . emv_field('02', 'Apoio Cafe Store');

    $payload = emv_field('00', '01')
        . emv_field('26', $merchantAccount)
        . emv_field('52', '0000')
        . emv_field('53', '986')
        . emv_field('54', number_format((float) $amount, 2, '.', ''))
        . emv_field('58', 'BR')
        . emv_field('59', $merchantName)
        . emv_field('60', $merchantCity)
        . emv_field('62', emv_field('05', $txid));

    $payloadForCrc = $payload . '6304';
    return $payloadForCrc . pix_crc16($payloadForCrc);
}

function qr_code_image_url($payload, $size = 240) {
    $size = max(160, min(420, (int) $size));
    return 'https://api.qrserver.com/v1/create-qr-code/?' . http_build_query([
        'size' => $size . 'x' . $size,
        'data' => (string) $payload,
    ]);
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
        return url('assets/images/mascote.png');
    }

    if (basename((string) $image_url) === 'placeholder.png') {
        return url('assets/images/mascote.png');
    }
    
    // Se já é URL completa (Cloudinary)
    if (strpos($image_url, 'http') === 0) {
        return $image_url;
    }
    
    // Se é caminho relativo sem diretório, assume que está em assets/images/produtos/
    if (strpos($image_url, '/') === false) {
        return url('assets/images/produtos/' . ltrim($image_url, '/'));
    }

    $relativePath = ltrim($image_url, '/');
    $absolutePath = __DIR__ . '/../' . $relativePath;
    if (!file_exists($absolutePath) && strpos($relativePath, 'assets/images/produtos/') === 0) {
        $fallbackMatches = glob(dirname($absolutePath) . '/*/' . basename($absolutePath));
        if (!empty($fallbackMatches[0])) {
            $relativePath = ltrim(str_replace(__DIR__ . '/../', '', $fallbackMatches[0]), '/');
        }
    }
    
    // Se é caminho relativo
    return url($relativePath);
}

function product_upload_image_files($files, $slug) {
    if (empty($files['name']) || !is_array($files['name'])) {
        return ['images' => [], 'errors' => []];
    }

    $allowedTypes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];
    $images = [];
    $errors = [];
    $safeSlug = slugify($slug ?: 'produto');
    $uploadDir = __DIR__ . '/../assets/uploads/products/' . $safeSlug;

    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true)) {
        return ['images' => [], 'errors' => ['Não foi possível criar a pasta de imagens do produto.']];
    }

    foreach ($files['name'] as $index => $name) {
        if (($files['error'][$index] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            continue;
        }

        if (($files['error'][$index] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            $errors[] = 'Não foi possível enviar uma das imagens.';
            continue;
        }

        if (($files['size'][$index] ?? 0) > 3 * 1024 * 1024) {
            $errors[] = 'Cada imagem precisa ter até 3MB.';
            continue;
        }

        $tmpName = $files['tmp_name'][$index] ?? '';
        $mime = $tmpName ? mime_content_type($tmpName) : '';
        if (!isset($allowedTypes[$mime])) {
            $errors[] = 'Use apenas imagens JPG, PNG ou WebP.';
            continue;
        }

        $filename = bin2hex(random_bytes(8)) . '.' . $allowedTypes[$mime];
        $destination = $uploadDir . '/' . $filename;
        if (!move_uploaded_file($tmpName, $destination)) {
            $errors[] = 'Falha ao salvar uma das imagens enviadas.';
            continue;
        }

        $images[] = 'assets/uploads/products/' . $safeSlug . '/' . $filename;
    }

    return ['images' => $images, 'errors' => array_values(array_unique($errors))];
}

function product_normalize_image_set($mainImage, $galleryImages, $uploadedImages = [], $limit = 4) {
    $items = array_merge(
        [trim((string) $mainImage)],
        is_array($galleryImages) ? $galleryImages : [],
        is_array($uploadedImages) ? $uploadedImages : []
    );

    $normalized = [];
    foreach ($items as $item) {
        $item = trim((string) $item);
        if ($item === '' || in_array($item, $normalized, true)) {
            continue;
        }
        $normalized[] = $item;
        if (count($normalized) >= $limit) {
            break;
        }
    }

    return [
        'main' => $normalized[0] ?? '',
        'gallery' => array_slice($normalized, 1),
    ];
}

function product_main_image(array $product) {
    return product_image($product['main_image_url'] ?? $product['image_url'] ?? '');
}

function product_type_label($type) {
    $labels = [
        'site' => 'Site',
        'landing_page' => 'Landing page',
        'video_curto' => 'Vídeo curto',
        'video_longo' => 'Vídeo longo',
        'web_app' => 'Web aplicação',
        'camiseta' => 'Camiseta',
        'acessorio' => 'Acessório',
        'chaveiro' => 'Chaveiro',
        'caneca' => 'Caneca',
        'moletom' => 'Moletom',
    ];

    return $labels[$type] ?? ucfirst(str_replace('_', ' ', (string) $type));
}

function normalize_payment_method($method) {
    $method = (string) $method;
    return in_array($method, ['pix', 'mercadopago', 'paypal'], true) ? $method : '';
}

function relative_days_label($dateTime, $prefix = 'Atualizada') {
    if (!$dateTime) {
        return 'Data indisponível';
    }

    try {
        $date = new DateTime((string) $dateTime);
        $now = new DateTime('now');
    } catch (Throwable $e) {
        return 'Data indisponível';
    }

    $days = (int) $date->diff($now)->format('%a');
    if ($days === 0) {
        return $prefix . ' hoje';
    }
    if ($days === 1) {
        return $prefix . ' há 1 dia';
    }

    return $prefix . ' há ' . $days . ' dias';
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
        if (in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'HEAD'], true)) {
            $_SESSION['intended_url'] = current_request_path();
        }
        flash('error', 'Faça login para continuar.');
        redirect('login.php');
    }
}

/**
 * Exigir usuário administrador
 */
function require_admin() {
    unset($_SESSION['user_cache']);
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

function validate_csrf_token($token) {
    return verify_csrf_token($token);
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

    try {
        $pdo = db();
        if (empty($_SESSION['last_seen_touch']) || time() - (int) $_SESSION['last_seen_touch'] > 60) {
            $touch = $pdo->prepare("UPDATE users SET last_seen_at = NOW() WHERE id = ?");
            $touch->execute([(int) $_SESSION['user_id']]);
            $_SESSION['last_seen_touch'] = time();
            unset($_SESSION['user_cache']);
        }

        // Cache em sessão para evitar queries repetidas na mesma requisição
        if (isset($_SESSION['user_cache'])) {
            return $_SESSION['user_cache'];
        }

        $stmt = $pdo->prepare("SELECT id, name, email, role, auth_provider, avatar_url, bio, last_seen_at, password_updated_at, created_at FROM users WHERE id = ?");
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

function user_is_online(array $user) {
    if (empty($user['last_seen_at'])) {
        return false;
    }

    return strtotime((string) $user['last_seen_at']) >= time() - 300;
}

function user_has_client_history($userId) {
    $stmt = db()->prepare("
        SELECT COUNT(*)
        FROM orders
        WHERE user_id = ?
          AND (
            payment_status IN ('approved', 'paid')
            OR status IN ('paid', 'completed', 'processing')
          )
    ");
    $stmt->execute([(int) $userId]);
    return (int) $stmt->fetchColumn() > 0;
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
    $stmt = db()->prepare("INSERT INTO users (name, email, password_hash, google_id, auth_provider, role, password_updated_at) VALUES (?, ?, ?, ?, 'google', 'customer', NULL)");
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
        bio TEXT NULL,
        last_seen_at TIMESTAMP NULL DEFAULT NULL,
        password_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    add_column_if_missing($pdo, 'users', 'google_id', "google_id VARCHAR(191) NULL UNIQUE AFTER password_hash");
    add_column_if_missing($pdo, 'users', 'auth_provider', "auth_provider ENUM('password', 'google') NOT NULL DEFAULT 'password' AFTER google_id");
    add_column_if_missing($pdo, 'users', 'avatar_url', "avatar_url VARCHAR(500) NULL AFTER role");
    add_column_if_missing($pdo, 'users', 'bio', "bio TEXT NULL AFTER avatar_url");
    add_column_if_missing($pdo, 'users', 'last_seen_at', "last_seen_at TIMESTAMP NULL DEFAULT NULL AFTER bio");
    add_column_if_missing($pdo, 'users', 'password_updated_at', "password_updated_at TIMESTAMP NULL DEFAULT NULL AFTER last_seen_at");
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
    try {
        $pdo->exec("ALTER TABLE products MODIFY type VARCHAR(40) NOT NULL DEFAULT 'digital'");
    } catch (Throwable $e) {
        error_log('Schema products type migration skipped: ' . $e->getMessage());
    }
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
    add_column_if_missing($pdo, 'product_reviews', 'verified_purchase', "verified_purchase TINYINT(1) NOT NULL DEFAULT 0 AFTER order_id");
    try {
        $pdo->exec("
            UPDATE product_reviews r
            SET verified_purchase = 1
            WHERE EXISTS (
                SELECT 1
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE oi.product_id = r.product_id
                  AND o.user_id = r.user_id
                  AND o.status NOT IN ('cancelled', 'cancelado')
            )
        ");
    } catch (Throwable $e) {
        error_log('Schema product_reviews verified_purchase migration skipped: ' . $e->getMessage());
    }

    $pdo->exec("CREATE TABLE IF NOT EXISTS review_images (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        review_id INT UNSIGNED NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        public_id VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_review_images_review FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS client_feedbacks (
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

    $pdo->exec("CREATE TABLE IF NOT EXISTS coupons (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS user_coupons (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        coupon_id INT UNSIGNED NOT NULL,
        status ENUM('active','used','expired') NOT NULL DEFAULT 'active',
        redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP NULL DEFAULT NULL,
        UNIQUE KEY unique_user_coupon (user_id, coupon_id),
        CONSTRAINT fk_user_coupons_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_user_coupons_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $couponStmt = $pdo->prepare("
        INSERT INTO coupons (code, title, description, discount_type, discount_value, status)
        VALUES (?, ?, ?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            description = VALUES(description),
            discount_type = VALUES(discount_type),
            discount_value = VALUES(discount_value),
            status = 'active'
    ");
    foreach ([
        ['CAFE10', '10% no próximo apoio', 'Cupom ativo para apoiar produtos CAFÉ STORE.', 'percent', 10.00],
        ['STARTUP15', '15% para comunidade', 'Benefício para devs, startups e networking.', 'percent', 15.00],
        ['FRETECAFE', 'Ajuda na entrega', 'Cupom reservado para quando a entrega física estiver ativa.', 'fixed', 12.00],
    ] as $coupon) {
        $couponStmt->execute($coupon);
    }
}
