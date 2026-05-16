<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();

$metrics = [
    'products' => db()->query('SELECT COUNT(*) FROM products')->fetchColumn(),
    'orders' => db()->query('SELECT COUNT(*) FROM orders')->fetchColumn(),
    'pending' => db()->query("SELECT COUNT(*) FROM orders WHERE payment_status = 'pending'")->fetchColumn(),
    'users' => db()->query('SELECT COUNT(*) FROM users')->fetchColumn(),
    'revenue' => db()->query("SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid'")->fetchColumn(),
];
include __DIR__ . '/../includes/header.php';
?>
<div class="admin-layout">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="admin-content">
        <div class="section-head compact">
            <div>
                <p class="eyebrow">painel administrativo</p>
                <h1>Dashboard</h1>
            </div>
        </div>
        <div class="metric-grid">
            <div class="metric"><span>Total de vendas</span><strong><?= money((float) $metrics['revenue']) ?></strong></div>
            <div class="metric"><span>Pedidos pendentes</span><strong><?= (int) $metrics['pending'] ?></strong></div>
            <div class="metric"><span>Produtos cadastrados</span><strong><?= (int) $metrics['products'] ?></strong></div>
            <div class="metric"><span>Usuários registrados</span><strong><?= (int) $metrics['users'] ?></strong></div>
        </div>
        <section class="panel mt-4">
            <p class="eyebrow">operação</p>
            <h2 class="text-2xl font-black">Resumo rápido</h2>
            <p class="muted">Você tem <?= (int) $metrics['orders'] ?> pedidos no total. Use o menu lateral para revisar produtos, pedidos e usuários.</p>
        </section>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
