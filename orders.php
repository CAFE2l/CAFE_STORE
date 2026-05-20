<?php
require_once __DIR__ . '/config/helpers.php';
require_login();

$stmt = db()->prepare("
    SELECT id, total, total_amount, status, payment_status, payment_method, created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
");
$stmt->execute([(int) $_SESSION['user_id']]);
$orders = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<div class="flex items-end justify-between gap-6 mb-6">
    <div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">minha conta</p>
        <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Meus pedidos</h1>
    </div>
    <a class="btn-ghost min-h-[44px]" href="<?= url('profile.php') ?>">Voltar ao perfil</a>
</div>

<section class="grid gap-3">
    <?php foreach ($orders as $order): ?>
        <article class="card grid items-center gap-4 p-4 md:grid-cols-[1fr_auto_auto_auto]">
            <div>
                <strong class="block text-text-primary">Pedido #<?= (int) $order['id'] ?></strong>
                <span class="mt-1 block text-sm text-text-muted"><?= e(date('d/m/Y H:i', strtotime((string) $order['created_at']))) ?></span>
            </div>
            <span class="badge border-amber-accent/40 text-amber-glow"><?= e($order['status']) ?></span>
            <strong class="text-amber-glow"><?= money((float) ($order['total_amount'] ?: $order['total'])) ?></strong>
            <a class="btn-ghost min-h-[40px] px-4" href="<?= url('order-detail.php?id=' . (int) $order['id']) ?>">Ver detalhe</a>
        </article>
    <?php endforeach; ?>

    <?php if (!$orders): ?>
        <div class="glass rounded-2xl p-6">
            <p class="text-text-muted">Você ainda não fez pedidos.</p>
            <a class="btn-primary mt-4" href="<?= url('products.php') ?>">Ver produtos</a>
        </div>
    <?php endif; ?>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
