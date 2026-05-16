<?php
require_once __DIR__ . '/../config/helpers.php';
require_login();

header('Content-Type: application/json');

// Próximo passo real:
// 1. Coloque o ACCESS_TOKEN em config/config.php.
// 2. Envie amount, order_id e payer para a API do Mercado Pago.
// 3. Salve provider_payment_id em payments e atualize payment_status do pedido.
if (MERCADO_PAGO_MOCK) {
    echo json_encode([
        'mode' => 'mock',
        'status' => 'pending',
        'message' => 'Pagamento mock criado. Configure MERCADO_PAGO_ACCESS_TOKEN para ativar a integração real.',
    ]);
    exit;
}

http_response_code(501);
echo json_encode(['error' => 'Integração real ainda não implementada neste MVP.']);
