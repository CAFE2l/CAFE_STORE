<?php
declare(strict_types=1);

require_once __DIR__ . '/database.php';

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function url(string $path = ''): string
{
    return rtrim(BASE_URL, '/') . '/' . ltrim($path, '/');
}

function absolute_url(string $path = ''): string
{
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $scheme = $https ? 'https' : 'http';

    return $scheme . '://' . $host . url($path);
}

function redirect(string $path): void
{
    header('Location: ' . url($path));
    exit;
}

function flash(string $type, string $message): void
{
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

function flashes(): array
{
    $messages = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $messages;
}

function slugify(string $text): string
{
    $text = iconv('UTF-8', 'ASCII//TRANSLIT', $text) ?: $text;
    $text = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $text) ?? '');
    return trim($text, '-') ?: 'produto';
}

function money(float $value): string
{
    return 'R$ ' . number_format($value, 2, ',', '.');
}

function excerpt(?string $text, int $limit = 100): string
{
    $text = trim((string) $text);
    if (function_exists('mb_strimwidth')) {
        return mb_strimwidth($text, 0, $limit, '...', 'UTF-8');
    }
    return strlen($text) > $limit ? substr($text, 0, $limit - 3) . '...' : $text;
}

function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }

    static $user = null;
    if ($user !== null) {
        return $user;
    }

    $stmt = db()->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch() ?: null;
    return $user;
}

function require_login(): void
{
    if (!current_user()) {
        flash('error', 'Faça login para continuar.');
        redirect('login.php');
    }
}

function require_admin(): void
{
    $user = current_user();
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        exit('Acesso negado.');
    }
}

function cart_items(): array
{
    return $_SESSION['cart'] ?? [];
}

function cart_count(): int
{
    return array_sum(array_map(static fn ($item) => (int) $item['quantity'], cart_items()));
}

function cart_products(): array
{
    $cart = cart_items();
    if (!$cart) {
        return [];
    }

    $ids = array_map('intval', array_keys($cart));
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = db()->prepare("SELECT * FROM products WHERE id IN ($placeholders)");
    $stmt->execute($ids);

    $rows = [];
    foreach ($stmt->fetchAll() as $product) {
        $quantity = (int) ($cart[$product['id']]['quantity'] ?? 1);
        $product['quantity'] = $quantity;
        $product['line_total'] = $quantity * (float) $product['price'];
        $rows[] = $product;
    }
    return $rows;
}

function cart_total(): float
{
    return array_reduce(cart_products(), static fn ($total, $item) => $total + (float) $item['line_total'], 0.0);
}

function product_image(?string $url): string
{
    return $url ?: 'assets/images/mascot.svg';
}

function google_oauth_configured(): bool
{
    return GOOGLE_CLIENT_ID !== '' && GOOGLE_CLIENT_SECRET !== '';
}

function google_redirect_uri(): string
{
    return absolute_url('google-callback.php');
}

function google_auth_url(string $state): string
{
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

function google_http_request(string $url, string $method = 'GET', array $data = []): array
{
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

function ensure_google_user_columns(): void
{
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

function login_with_google_user(array $profile): array
{
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
