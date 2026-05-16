<?php
require_once __DIR__ . '/config/helpers.php';

$categories = db()->query('SELECT * FROM categories ORDER BY name')->fetchAll();
$search = trim($_GET['q'] ?? '');
$category = (int) ($_GET['category_id'] ?? 0);

$where = ["p.status = 'active'"];
$params = [];
if ($search !== '') {
    $where[] = '(p.name LIKE ? OR p.description LIKE ?)';
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if ($category > 0) {
    $where[] = 'p.category_id = ?';
    $params[] = $category;
}

$sql = 'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE ' . implode(' AND ', $where) . ' ORDER BY p.created_at DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<section class="section-head">
    <div>
        <p class="eyebrow">catálogo digital</p>
        <h1>Produtos <span class="gradient-text">CAFÉ</span></h1>
        <p class="muted max-w-2xl mt-4">Explore overlays, packs, templates, wallpapers e presets para organizar sua marca online.</p>
    </div>
</section>

<form class="filters" method="get">
    <input name="q" value="<?= e($search) ?>" placeholder="Buscar overlays, packs, templates...">
    <select name="category_id">
        <option value="0">Todas as categorias</option>
        <?php foreach ($categories as $cat): ?>
            <option value="<?= (int) $cat['id'] ?>" <?= $category === (int) $cat['id'] ? 'selected' : '' ?>><?= e($cat['name']) ?></option>
        <?php endforeach; ?>
    </select>
    <button class="btn primary" type="submit">Filtrar</button>
</form>

<div class="product-grid">
    <?php foreach ($products as $product): ?>
        <article class="product-card">
            <a href="<?= url('product.php?slug=' . urlencode($product['slug'])) ?>">
                <img src="<?= e(product_main_image($product)) ?>" alt="<?= e($product['name']) ?>">
            </a>
            <div>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="pill"><?= e($product['category_name'] ?? 'CAFÉ') ?></span>
                    <span class="status-badge orange"><?= e($product['type']) ?></span>
                </div>
                <h3><?= e($product['name']) ?></h3>
                <p><?= e(excerpt($product['short_description'] ?: $product['description'], 100)) ?></p>
                <strong class="product-price text-2xl"><?= money((float) $product['price']) ?></strong>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <a class="btn ghost full" href="<?= url('product.php?slug=' . urlencode($product['slug'])) ?>">Detalhes</a>
                <form action="<?= url('api/cart-add.php') ?>" method="post">
                    <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                    <button class="btn primary full" type="submit">Adicionar</button>
                </form>
            </div>
        </article>
    <?php endforeach; ?>
    <?php if (!$products): ?><p class="empty glass-card p-5">Nenhum produto encontrado.</p><?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
