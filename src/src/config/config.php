<?php
declare(strict_types=1);

$sessionPath = dirname(__DIR__) . '/storage/sessions';
if (!is_dir($sessionPath)) {
    mkdir($sessionPath, 0775, true);
}
session_save_path($sessionPath);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

date_default_timezone_set('America/Sao_Paulo');

define('APP_NAME', 'CAFÉ STORE');
define('BASE_URL', '/cafe-store');

// Google OAuth: crie credenciais no Google Cloud Console e configure o callback:
// http://localhost/cafe-store/google-callback.php
define('GOOGLE_CLIENT_ID', '');
define('GOOGLE_CLIENT_SECRET', '');

// Configure estes dados no InfinityFree/MySQL.
define('DB_HOST', 'localhost');
define('DB_NAME', 'cafe_store');
define('DB_USER', 'root');
define('DB_PASS', 'mysql');
define('DB_CHARSET', 'utf8mb4');

// Mercado Pago: troque pelo token real quando sair do modo mock.
define('MERCADO_PAGO_ACCESS_TOKEN', 'COLOQUE_SEU_ACCESS_TOKEN_AQUI');
define('MERCADO_PAGO_MOCK', true);

// Cloudinary: usado futuramente no upload real.
define('CLOUDINARY_CLOUD_NAME', 'COLOQUE_SEU_CLOUD_NAME');
define('CLOUDINARY_API_KEY', 'COLOQUE_SUA_API_KEY');
define('CLOUDINARY_API_SECRET', 'COLOQUE_SEU_API_SECRET');
