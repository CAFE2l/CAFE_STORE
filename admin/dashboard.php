<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();

$pdo = db();
$metrics = [
    'products' => (int) $pdo->query("SELECT COUNT(*) FROM products WHERE status = 'active'")->fetchColumn(),
    'orders' => (int) $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn(),
    'pending' => (int) $pdo->query("SELECT COUNT(*) FROM orders WHERE payment_status = 'pending'")->fetchColumn(),
    'users' => (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn(),
    'customers' => (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn(),
    'reviews_pending' => (int) $pdo->query("SELECT COUNT(*) FROM product_reviews WHERE status = 'pending'")->fetchColumn(),
    'coupons_active' => (int) $pdo->query("SELECT COUNT(*) FROM coupons WHERE status = 'active'")->fetchColumn(),
    'revenue' => (float) $pdo->query("SELECT COALESCE(SUM(CASE WHEN total_amount > 0 THEN total_amount ELSE total END), 0) FROM orders WHERE payment_status IN ('paid','approved')")->fetchColumn(),
];

$recentOrders = $pdo->query("
    SELECT o.*, u.name AS user_name, u.email AS user_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
    LIMIT 6
")->fetchAll();

$recentUsers = $pdo->query("SELECT id, name, email, role, created_at, last_seen_at FROM users ORDER BY created_at DESC LIMIT 6")->fetchAll();

$lowStock = $pdo->query("SELECT id, name, slug, stock, type FROM products WHERE status = 'active' ORDER BY stock ASC, updated_at DESC LIMIT 5")->fetchAll();

$pendingReviews = $pdo->query("
    SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name, p.name AS product_name
    FROM product_reviews r
    JOIN users u ON u.id = r.user_id
    JOIN products p ON p.id = r.product_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at DESC
    LIMIT 4
")->fetchAll();

$topProducts = $pdo->query("
    SELECT p.name, p.slug, COALESCE(SUM(oi.quantity), 0) AS sold, COALESCE(SUM(oi.total_price), 0) AS total
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    GROUP BY p.id
    ORDER BY sold DESC, p.created_at DESC
    LIMIT 5
")->fetchAll();

include __DIR__ . '/../includes/header.php';
?>
<div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[240px_1fr]">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="grid min-w-0 gap-5">
        <div class="flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
            <div>
                <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">painel administrativo</p>
                <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Dashboard da empresa</h1>
            </div>
            <a class="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-glow-400 bg-glow-400 px-[18px] font-black text-midnight-950" href="<?= url('admin/products.php') ?>">Gerenciar produtos</a>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div class="min-h-[132px] rounded-2xl border border-white/10 bg-white/5 p-[18px] backdrop-blur-lg">
                <span class="text-[0.92rem] text-midnight-400">Receita aprovada</span>
                <strong class="mt-3.5 block text-[clamp(1.55rem,3vw,2.15rem)] font-black leading-none text-glow-400"><?= money($metrics['revenue']) ?></strong>
            </div>
            <div class="min-h-[132px] rounded-2xl border border-white/10 bg-white/5 p-[18px] backdrop-blur-lg">
                <span class="text-[0.92rem] text-midnight-400">Pedidos pendentes</span>
                <strong class="mt-3.5 block text-[clamp(1.55rem,3vw,2.15rem)] font-black leading-none text-glow-400"><?= $metrics['pending'] ?></strong>
            </div>
            <div class="min-h-[132px] rounded-2xl border border-white/10 bg-white/5 p-[18px] backdrop-blur-lg">
                <span class="text-[0.92rem] text-midnight-400">Produtos ativos</span>
                <strong class="mt-3.5 block text-[clamp(1.55rem,3vw,2.15rem)] font-black leading-none text-glow-400"><?= $metrics['products'] ?></strong>
            </div>
            <div class="min-h-[132px] rounded-2xl border border-white/10 bg-white/5 p-[18px] backdrop-blur-lg">
                <span class="text-[0.92rem] text-midnight-400">Clientes registrados</span>
                <strong class="mt-3.5 block text-[clamp(1.55rem,3vw,2.15rem)] font-black leading-none text-glow-400"><?= $metrics['customers'] ?></strong>
            </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <a class="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-glow-400" href="<?= url('admin/orders.php') ?>">
                <span class="text-sm text-midnight-400">Pedidos totais</span>
                <strong class="mt-2 block text-2xl font-black text-white"><?= $metrics['orders'] ?></strong>
            </a>
            <a class="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-glow-400" href="<?= url('admin/users.php') ?>">
                <span class="text-sm text-midnight-400">Usuários totais</span>
                <strong class="mt-2 block text-2xl font-black text-white"><?= $metrics['users'] ?></strong>
            </a>
            <a class="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-glow-400" href="<?= url('admin/reviews.php?status=pending') ?>">
                <span class="text-sm text-midnight-400">Avaliações pendentes</span>
                <strong class="mt-2 block text-2xl font-black text-white"><?= $metrics['reviews_pending'] ?></strong>
            </a>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                <span class="text-sm text-midnight-400">Cupons ativos</span>
                <strong class="mt-2 block text-2xl font-black text-white"><?= $metrics['coupons_active'] ?></strong>
            </div>
        </div>

        <div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <section class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
                <div class="mb-4 flex items-center justify-between gap-4">
                    <h2 class="m-0 text-2xl font-black text-white">Pedidos recentes</h2>
                    <a class="text-sm font-black text-glow-400" href="<?= url('admin/orders.php') ?>">Ver todos</a>
                </div>
                <div class="grid gap-3">
                    <?php foreach ($recentOrders as $order): ?>
                        <div class="grid items-center gap-3 rounded-[10px] border border-white/10 bg-midnight-950/60 p-4 md:grid-cols-[1fr_auto_auto]">
                            <div>
                                <strong class="text-white">#<?= (int) $order['id'] ?> - <?= e($order['user_name'] ?? 'Cliente') ?></strong>
                                <p class="mt-1 text-sm text-midnight-400"><?= e($order['user_email'] ?? '') ?> • <?= date('d/m/Y H:i', strtotime((string) $order['created_at'])) ?></p>
                            </div>
                            <span class="rounded-full border border-white/20 px-3 py-1 text-xs font-black text-midnight-300"><?= e($order['payment_status']) ?></span>
                            <strong class="text-glow-400"><?= money((float) ($order['total_amount'] ?? $order['total'])) ?></strong>
                        </div>
                    <?php endforeach; ?>
                    <?php if (!$recentOrders): ?><p class="text-midnight-400">Nenhum pedido encontrado.</p><?php endif; ?>
                </div>
            </section>

            <section class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
                <h2 class="m-0 mb-4 text-2xl font-black text-white">Estoque e produtos</h2>
                <div class="grid gap-3">
                    <?php foreach ($lowStock as $product): ?>
                        <a class="rounded-[10px] border border-white/10 bg-midnight-950/60 p-4 transition-all hover:border-glow-400" href="<?= url('admin/product-edit.php?id=' . (int) $product['id']) ?>">
                            <div class="flex items-center justify-between gap-3">
                                <strong class="text-white"><?= e($product['name']) ?></strong>
                                <span class="text-glow-400"><?= (int) $product['stock'] ?></span>
                            </div>
                            <p class="mt-1 text-sm text-midnight-400"><?= e(product_type_label($product['type'])) ?></p>
                        </a>
                    <?php endforeach; ?>
                </div>
            </section>
        </div>

        <div class="grid gap-5 xl:grid-cols-3">
            <section class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg xl:col-span-1">
                <h2 class="m-0 mb-4 text-2xl font-black text-white">Usuários recentes</h2>
                <div class="grid gap-3">
                    <?php foreach ($recentUsers as $recentUser): ?>
                        <div class="rounded-[10px] border border-white/10 bg-midnight-950/60 p-4">
                            <strong class="text-white"><?= e($recentUser['name']) ?></strong>
                            <p class="mt-1 text-sm text-midnight-400"><?= e($recentUser['email']) ?></p>
                            <span class="mt-2 inline-flex rounded-full border border-white/20 px-3 py-1 text-xs font-black text-midnight-300"><?= e($recentUser['role']) ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

            <section class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg xl:col-span-1">
                <h2 class="m-0 mb-4 text-2xl font-black text-white">Avaliações pendentes</h2>
                <div class="grid gap-3">
                    <?php foreach ($pendingReviews as $review): ?>
                        <a class="rounded-[10px] border border-white/10 bg-midnight-950/60 p-4 transition-all hover:border-glow-400" href="<?= url('admin/reviews.php') ?>">
                            <div class="flex items-center justify-between gap-3">
                                <strong class="text-white"><?= e($review['product_name']) ?></strong>
                                <span class="text-glow-400"><?= str_repeat('★', (int) $review['rating']) ?></span>
                            </div>
                            <p class="mt-2 text-sm text-midnight-400"><?= e(excerpt($review['comment'] ?: 'Sem comentário.', 100)) ?></p>
                            <p class="mt-2 text-xs font-bold text-midnight-500"><?= e($review['user_name']) ?></p>
                        </a>
                    <?php endforeach; ?>
                    <?php if (!$pendingReviews): ?><p class="text-midnight-400">Nenhuma avaliação pendente.</p><?php endif; ?>
                </div>
            </section>

            <section class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg xl:col-span-1">
                <h2 class="m-0 mb-4 text-2xl font-black text-white">Mais apoiados</h2>
                <div class="grid gap-3">
                    <?php foreach ($topProducts as $product): ?>
                        <a class="rounded-[10px] border border-white/10 bg-midnight-950/60 p-4 transition-all hover:border-glow-400" href="<?= url('product.php?slug=' . urlencode($product['slug'])) ?>">
                            <div class="flex items-center justify-between gap-3">
                                <strong class="text-white"><?= e($product['name']) ?></strong>
                                <span class="text-glow-400"><?= (int) $product['sold'] ?>x</span>
                            </div>
                            <p class="mt-1 text-sm text-midnight-400"><?= money((float) $product['total']) ?></p>
                        </a>
                    <?php endforeach; ?>
                </div>
            </section>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
