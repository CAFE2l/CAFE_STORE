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
    unset($_SESSION['cart'][$productId]);
    flash('success', 'Produto removido.');
}

redirect('cart.php');
