<?php
require_once __DIR__ . '/../config/helpers.php';
require_login();
require_post();

$productId = (int) ($_POST['product_id'] ?? 0);
$redirectTo = trim((string) ($_POST['redirect_to'] ?? 'profile.php'));

if ($productId <= 0) {
    flash('error', 'Produto inválido.');
    redirect($redirectTo ?: 'products.php');
}

$stmt = db()->prepare("SELECT id FROM products WHERE id = ? AND status = 'active' LIMIT 1");
$stmt->execute([$productId]);
if (!$stmt->fetchColumn()) {
    flash('error', 'Produto não encontrado.');
    redirect($redirectTo ?: 'products.php');
}

$existing = db()->prepare('SELECT id FROM favorites WHERE user_id = ? AND product_id = ? LIMIT 1');
$existing->execute([(int) $_SESSION['user_id'], $productId]);
$favoriteId = $existing->fetchColumn();

if ($favoriteId) {
    $delete = db()->prepare('DELETE FROM favorites WHERE id = ? AND user_id = ?');
    $delete->execute([(int) $favoriteId, (int) $_SESSION['user_id']]);
    flash('success', 'Produto removido da lista de desejo.');
} else {
    $insert = db()->prepare('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)');
    $insert->execute([(int) $_SESSION['user_id'], $productId]);
    flash('success', 'Produto adicionado à lista de desejo.');
}

redirect($redirectTo ?: 'products.php');
