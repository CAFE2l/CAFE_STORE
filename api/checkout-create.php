<?php
require_once __DIR__ . '/../config/helpers.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('checkout.php');
}

if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
    flash('error', 'Sessão expirada. Tente novamente.');
    redirect('checkout.php');
}

$items = cart_products();
if (!$items) {
    flash('error', 'Carrinho vazio.');
    redirect('products.php');
}

$method = normalize_payment_method($_POST['payment_method'] ?? '');
if ($method === '') {
    flash('error', 'Escolha um método de pagamento.');
    redirect('checkout.php');
}

if ($method !== 'pix') {
    flash('error', 'No momento, finalize este apoio usando Pix.');
    redirect('checkout.php');
}

$requiredFields = [
    'customer_phone' => 'telefone',
    'postal_code' => 'CEP',
    'street' => 'rua',
    'number' => 'número',
    'district' => 'bairro',
    'city' => 'cidade',
    'state' => 'estado',
];

$checkoutData = [];
foreach ($requiredFields as $field => $label) {
    $value = trim((string) ($_POST[$field] ?? ''));
    if ($value === '') {
        flash('error', 'Informe o campo obrigatório: ' . $label . '.');
        redirect('checkout.php');
    }
    $checkoutData[$field] = $value;
}

$checkoutData['complement'] = trim((string) ($_POST['complement'] ?? ''));
$checkoutData['state'] = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $checkoutData['state']), 0, 2));
if (strlen($checkoutData['state']) !== 2) {
    flash('error', 'Informe o estado com 2 letras.');
    redirect('checkout.php');
}

$shippingAddress = json_encode([
    'postal_code' => $checkoutData['postal_code'],
    'street' => $checkoutData['street'],
    'number' => $checkoutData['number'],
    'complement' => $checkoutData['complement'],
    'district' => $checkoutData['district'],
    'city' => $checkoutData['city'],
    'state' => $checkoutData['state'],
    'country' => 'Brasil',
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$pdo = db();
$user = current_user();
$total = cart_total();
$pixPayload = pix_br_code($total, 'CAFESTORE' . (int) $_SESSION['user_id']);

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('INSERT INTO orders (user_id, total, total_amount, status, payment_status, payment_method, customer_name, customer_email, customer_phone, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $_SESSION['user_id'],
        $total,
        $total,
        'pending',
        'pending',
        $method,
        $user['name'] ?? '',
        $user['email'] ?? '',
        $checkoutData['customer_phone'],
        $shippingAddress,
    ]);
    $orderId = (int) $pdo->lastInsertId();

    $itemStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, quantity, price, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)');
    foreach ($items as $item) {
        $lineTotal = (float) $item['price'] * (int) $item['quantity'];
        $itemStmt->execute([$orderId, $item['id'], $item['name'], $item['quantity'], $item['price'], $item['price'], $lineTotal]);
    }

    $provider = $method === 'pix' ? 'pix_static_br_code' : $method;
    $payStmt = $pdo->prepare('INSERT INTO payments (order_id, user_id, payment_method, payment_provider, provider, provider_payment_id, status, amount, currency, pix_copy_paste, paypal_order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $payStmt->execute([
        $orderId,
        $_SESSION['user_id'],
        $method,
        $provider,
        $provider,
        $method === 'pix' ? 'pix-' . $orderId : 'mock-' . $orderId,
        'pending',
        $total,
        'BRL',
        $method === 'pix' ? $pixPayload : null,
        $method === 'paypal' ? 'PAYPAL-MOCK-' . $orderId : null,
    ]);

    $pdo->commit();
    unset($_SESSION['cart']);
    flash('success', 'Pedido #' . $orderId . ' criado. Método: ' . strtoupper($method) . '.');
    redirect('order-confirmation.php?id=' . $orderId);
} catch (Throwable $e) {
    $pdo->rollBack();
    flash('error', 'Não foi possível criar o pedido.');
    redirect('checkout.php');
}
