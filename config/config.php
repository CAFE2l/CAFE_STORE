<?php
if (!defined('APP_NAME')) {
    define('APP_NAME', getenv('APP_NAME') ?: 'CAFÉ STORE');
}

if (!defined('BASE_URL')) {
    define('BASE_URL', getenv('BASE_URL') ?: '/');
}

if (!defined('GOOGLE_CLIENT_ID')) {
    define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: '');
}

if (!defined('GOOGLE_CLIENT_SECRET')) {
    define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '');
}

if (!defined('CLOUDINARY_CLOUD_NAME')) {
    define('CLOUDINARY_CLOUD_NAME', getenv('CLOUDINARY_CLOUD_NAME') ?: '');
}

if (!defined('CLOUDINARY_API_KEY')) {
    define('CLOUDINARY_API_KEY', getenv('CLOUDINARY_API_KEY') ?: '');
}

if (!defined('CLOUDINARY_API_SECRET')) {
    define('CLOUDINARY_API_SECRET', getenv('CLOUDINARY_API_SECRET') ?: '');
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
