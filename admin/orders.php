<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();
$orders = db()->query('SELECT o.*, u.name AS user_name FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC')->fetchAll();
include __DIR__ . '/../includes/header.php';
?>
<div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[240px_1fr]">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="grid gap-5 min-w-0">
        <div class="flex items-end justify-between gap-6">
            <div>
                <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">operações</p>
                <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Pedidos</h1>
            </div>
        </div>
        <div class="grid gap-3">
            <?php foreach ($orders as $order): ?>
                <div class="grid items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-lg max-md:grid-cols-1 md:grid-cols-[1.4fr_120px_120px_minmax(160px,auto)]">
                    <span class="font-bold">#<?= (int) $order['id'] ?> - <?= e($order['user_name'] ?? 'Cliente') ?><small class="mt-1 block text-midnight-400 font-semibold"><?= e($order['created_at']) ?></small></span>
                    <strong class="text-glow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><?= money((float) ($order['total_amount'] ?? $order['total'])) ?></strong>
                    <span class="inline-flex w-fit items-center justify-center rounded-full border border-ember-500/40 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-ember-300"><?= e($order['status']) ?></span>
                    <span class="inline-flex w-fit items-center justify-center rounded-full border <?= $order['payment_status'] === 'paid' ? 'border-white/20 text-glow-400' : 'border-fire-500/40 text-fire-300' ?> px-[9px] py-[4px] text-[0.76rem] font-bold leading-none"><?= e($order['payment_status']) ?> / <?= e($order['payment_method']) ?></span>
                </div>
            <?php endforeach; ?>
            <?php if (!$orders): ?><p class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg text-midnight-400">Nenhum pedido encontrado.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
