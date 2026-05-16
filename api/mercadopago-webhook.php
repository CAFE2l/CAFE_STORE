<?php
require_once __DIR__ . '/../config/helpers.php';

header('Content-Type: application/json');

// Webhook preparado para receber notificações do Mercado Pago.
// No modo real, valide a assinatura/notificação, consulte o pagamento no Mercado Pago,
// atualize payments.status e orders.payment_status.
$payload = file_get_contents('php://input');
error_log('Mercado Pago webhook: ' . $payload);

echo json_encode(['received' => true]);
