<?php
require_once __DIR__ . '/config/helpers.php';
require_login();
$user = current_user();
$stmt = db()->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
$stmt->execute([$user['id']]);
$orders = $stmt->fetchAll();
include __DIR__ . '/includes/header.php';
?>
<section class="section-head">
    <div>
        <p class="eyebrow">minha conta</p>
        <h1>Olá, <span class="gradient-text"><?= e($user['name']) ?></span></h1>
    </div>
</section>
<div class="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
    <section class="panel">
        <p class="eyebrow">perfil</p>
        <div class="grid gap-3">
            <p><strong>E-mail:</strong> <span class="muted"><?= e($user['email']) ?></span></p>
            <p><strong>Tipo:</strong> <span class="status-badge"><?= e($user['role']) ?></span></p>
        </div>
        <a class="btn ghost mt-5" href="<?= url('products.php') ?>">Continuar comprando</a>
    </section>
    <section class="panel">
        <p class="eyebrow">histórico</p>
        <h2 class="text-2xl font-black mb-4">Pedidos</h2>
        <div class="table profile-orders">
            <?php foreach ($orders as $order): ?>
                <div class="table-row">
                    <span>#<?= (int) $order['id'] ?> <small><?= e($order['status']) ?> / <?= e($order['payment_status']) ?></small></span>
                    <strong class="product-price"><?= money((float) $order['total']) ?></strong>
                </div>
            <?php endforeach; ?>
        </div>
        <?php if (!$orders): ?><p class="muted">Você ainda não fez pedidos.</p><?php endif; ?>
    </section>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
