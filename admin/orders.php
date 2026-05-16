<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();
$orders = db()->query('SELECT o.*, u.name AS user_name FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC')->fetchAll();
include __DIR__ . '/../includes/header.php';
?>
<div class="admin-layout">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="admin-content">
        <div class="section-head compact">
            <div>
                <p class="eyebrow">operações</p>
                <h1>Pedidos</h1>
            </div>
        </div>
        <div class="table admin-table">
            <?php foreach ($orders as $order): ?>
                <div class="table-row orders-row">
                    <span class="font-bold">#<?= (int) $order['id'] ?> - <?= e($order['user_name'] ?? 'Cliente') ?><small><?= e($order['created_at']) ?></small></span>
                    <strong class="product-price"><?= money((float) ($order['total_amount'] ?? $order['total'])) ?></strong>
                    <span class="status-badge orange"><?= e($order['status']) ?></span>
                    <span class="status-badge <?= $order['payment_status'] === 'paid' ? '' : 'red' ?>"><?= e($order['payment_status']) ?> / <?= e($order['payment_method']) ?></span>
                </div>
            <?php endforeach; ?>
            <?php if (!$orders): ?><p class="empty glass-card p-5">Nenhum pedido encontrado.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
