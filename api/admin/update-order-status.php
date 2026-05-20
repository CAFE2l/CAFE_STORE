<?php
require_once __DIR__ . '/../../config/helpers.php';
require_admin();

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!validate_csrf_token($_POST['csrf_token'] ?? '')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Token CSRF inválido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$orderId = (int) ($_POST['order_id'] ?? 0);
$status = trim((string) ($_POST['status'] ?? ''));
$allowedStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

if ($orderId <= 0 || !in_array($status, $allowedStatuses, true)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Pedido ou status inválido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$exists = db()->prepare('SELECT id FROM orders WHERE id = ? LIMIT 1');
$exists->execute([$orderId]);
if (!$exists->fetchColumn()) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Pedido não encontrado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$stmt = db()->prepare('UPDATE orders SET status = ? WHERE id = ?');
$stmt->execute([$status, $orderId]);

echo json_encode(['success' => true, 'message' => 'Status do pedido atualizado.'], JSON_UNESCAPED_UNICODE);
