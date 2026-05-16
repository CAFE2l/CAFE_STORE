<?php
require_once __DIR__ . '/../../config/helpers.php';

$payload = file_get_contents('php://input') ?: '';
error_log('Mercado Pago webhook recebido: ' . $payload);

http_response_code(200);
echo 'ok';
