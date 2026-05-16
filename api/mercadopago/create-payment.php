<?php
require_once __DIR__ . '/../../config/helpers.php';
require_login();
require_post();

if (MERCADOPAGO_ACCESS_TOKEN === '') {
    http_response_code(503);
    echo json_encode(['ok' => false, 'message' => 'MERCADOPAGO_ACCESS_TOKEN não configurado.']);
    exit;
}

echo json_encode(['ok' => true, 'message' => 'Endpoint Mercado Pago preparado para integração real.']);
