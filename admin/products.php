<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();
$products = db()->query('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.created_at DESC')->fetchAll();
include __DIR__ . '/../includes/header.php';
?>
<div class="admin-layout">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="admin-content">
        <div class="section-head compact">
            <div>
                <p class="eyebrow">estoque digital</p>
                <h1>Produtos</h1>
            </div>
            <a class="btn primary" href="<?= url('admin/product-create.php') ?>">Novo produto</a>
        </div>
        <div class="table admin-table">
            <?php foreach ($products as $product): ?>
                <div class="table-row products-row">
                    <span class="min-w-[220px] font-bold"><?= e($product['name']) ?> <small><?= e($product['category_name'] ?? 'Sem categoria') ?></small></span>
                    <strong class="product-price"><?= money((float) $product['price']) ?></strong>
                    <span class="status-badge <?= $product['status'] === 'active' ? '' : 'orange' ?>"><?= e($product['status']) ?></span>
                    <a class="btn small ghost" href="<?= url('admin/product-edit.php?id=' . (int) $product['id']) ?>">Editar</a>
                    <a class="link-danger" href="<?= url('admin/product-delete.php?id=' . (int) $product['id']) ?>">Excluir</a>
                </div>
            <?php endforeach; ?>
            <?php if (!$products): ?><p class="empty glass-card p-5">Nenhum produto cadastrado.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
