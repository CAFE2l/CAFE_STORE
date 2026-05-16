<?php
require_once __DIR__ . '/../../config/helpers.php';
require_login();
require_post();

if (PAYPAL_CLIENT_ID === '' || PAYPAL_CLIENT_SECRET === '') {
    http_response_code(503);
    echo json_encode(['ok' => false, 'message' => 'PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET não configurados.']);
    exit;
}

echo json_encode(['ok' => true, 'message' => 'Endpoint PayPal preparado para capturar ordem real.']);
