<?php
require_once __DIR__ . '/../../config/helpers.php';
require_login();
require_post();

if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
    flash('error', 'Sessão expirada. Tente novamente.');
    redirect('products.php');
}

$productId = (int) ($_POST['product_id'] ?? 0);
$rating = (int) ($_POST['rating'] ?? 0);
$comment = trim(strip_tags($_POST['comment'] ?? ''));

if ($productId <= 0 || $rating < 1 || $rating > 5 || $comment === '') {
    flash('error', 'Informe nota de 1 a 5 e comentário.');
    redirect('product.php?id=' . $productId);
}

$stmt = db()->prepare('SELECT id FROM products WHERE id = ?');
$stmt->execute([$productId]);
if (!$stmt->fetch()) {
    flash('error', 'Produto inválido.');
    redirect('products.php');
}

$orderStmt = db()->prepare("SELECT oi.order_id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = ? AND o.user_id = ? AND o.status NOT IN ('cancelled', 'cancelado') ORDER BY o.created_at DESC LIMIT 1");
$orderStmt->execute([$productId, $_SESSION['user_id']]);
$orderId = $orderStmt->fetchColumn() ?: null;

if (!$orderId) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Você precisa ter comprado este produto para avaliá-lo'], JSON_UNESCAPED_UNICODE);
    exit;
}

$existing = db()->prepare('SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ? LIMIT 1');
$existing->execute([$productId, $_SESSION['user_id']]);
$reviewId = (int) $existing->fetchColumn();

if ($reviewId > 0) {
    $update = db()->prepare("UPDATE product_reviews SET rating = ?, comment = ?, order_id = ?, verified_purchase = 1, status = 'pending' WHERE id = ?");
    $update->execute([$rating, $comment, $orderId, $reviewId]);
} else {
    $insert = db()->prepare("INSERT INTO product_reviews (product_id, user_id, order_id, verified_purchase, rating, comment, status) VALUES (?, ?, ?, 1, ?, ?, 'pending')");
    $insert->execute([$productId, $_SESSION['user_id'], $orderId, $rating, $comment]);
    $reviewId = (int) db()->lastInsertId();
}

if (!empty($_FILES['review_images']['name'][0])) {
    require_once __DIR__ . '/upload-review-image.php';
    handle_review_image_uploads($reviewId, $_FILES['review_images']);
}

flash('success', 'Avaliação enviada para moderação.');
redirect('product.php?id=' . $productId);
