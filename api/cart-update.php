<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validate_csrf_token($_POST['csrf_token'] ?? '')) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'Token CSRF inválido.']);
        exit;
    }

    $productId = (int) ($_POST['product_id'] ?? 0);
    $quantity = max(1, (int) ($_POST['quantity'] ?? 1));

    $stmt = db()->prepare('SELECT stock FROM products WHERE id = ?');
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    if ($product && isset($_SESSION['cart'][$productId])) {
        $_SESSION['cart'][$productId]['quantity'] = min($quantity, max(1, (int) $product['stock']));
        flash('success', 'Carrinho atualizado.');
    }
}

redirect('cart.php');
