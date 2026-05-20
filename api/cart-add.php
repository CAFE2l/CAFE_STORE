<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('products.php');
}

if (!validate_csrf_token($_POST['csrf_token'] ?? '')) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Token CSRF inválido.']);
    exit;
}

$productId = (int) ($_POST['product_id'] ?? 0);
$quantity = max(1, (int) ($_POST['quantity'] ?? 1));

$stmt = db()->prepare("SELECT id, stock, status FROM products WHERE id = ?");
$stmt->execute([$productId]);
$product = $stmt->fetch();

if (!$product || $product['status'] !== 'active' || (int) $product['stock'] <= 0) {
    flash('error', 'Produto indisponível.');
    redirect('products.php');
}

$quantity = min($quantity, (int) $product['stock']);
$_SESSION['cart'][$productId]['quantity'] = min((int) $product['stock'], (int) ($_SESSION['cart'][$productId]['quantity'] ?? 0) + $quantity);

flash('success', 'Produto adicionado ao carrinho.');
$redirectTo = $_POST['redirect_to'] ?? 'cart.php';
$allowedRedirects = ['cart.php', 'checkout.php'];
redirect(in_array($redirectTo, $allowedRedirects, true) ? $redirectTo : 'cart.php');
