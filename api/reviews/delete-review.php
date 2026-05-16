<?php
require_once __DIR__ . '/../../config/helpers.php';
require_login();
require_post();

if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
    flash('error', 'Sessão expirada. Tente novamente.');
    redirect('products.php');
}

$productId = (int) ($_POST['product_id'] ?? 0);
$stmt = db()->prepare('DELETE FROM product_reviews WHERE product_id = ? AND user_id = ?');
$stmt->execute([$productId, $_SESSION['user_id']]);

flash('success', 'Avaliação excluída.');
redirect('product.php?id=' . $productId);
