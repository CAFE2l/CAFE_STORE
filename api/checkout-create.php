<?php
require_once __DIR__ . '/../config/helpers.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('checkout.php');
}

$items = cart_products();
if (!$items) {
    flash('error', 'Carrinho vazio.');
    redirect('products.php');
}

$method = in_array($_POST['payment_method'] ?? 'pix', ['pix', 'card'], true) ? $_POST['payment_method'] : 'pix';
$pdo = db();

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('INSERT INTO orders (user_id, total, status, payment_status, payment_method) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$_SESSION['user_id'], cart_total(), 'created', 'pending', $method]);
    $orderId = (int) $pdo->lastInsertId();

    $itemStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    foreach ($items as $item) {
        $itemStmt->execute([$orderId, $item['id'], $item['quantity'], $item['price']]);
    }

    $payStmt = $pdo->prepare('INSERT INTO payments (order_id, provider, provider_payment_id, status, amount) VALUES (?, ?, ?, ?, ?)');
    $payStmt->execute([$orderId, 'mercado_pago_mock', 'mock-' . $orderId, 'pending', cart_total()]);

    $pdo->commit();
    unset($_SESSION['cart']);
    flash('success', 'Pedido #' . $orderId . ' criado em modo mock. Integração Mercado Pago pronta para evoluir.');
    redirect('profile.php');
} catch (Throwable $e) {
    $pdo->rollBack();
    flash('error', 'Não foi possível criar o pedido.');
    redirect('checkout.php');
}
