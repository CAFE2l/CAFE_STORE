<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $productId = (int) ($_POST['product_id'] ?? 0);
    unset($_SESSION['cart'][$productId]);
    flash('success', 'Produto removido.');
}

redirect('cart.php');
