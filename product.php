<?php
require_once __DIR__ . '/config/helpers.php';

$slug = $_GET['slug'] ?? '';
$id = (int) ($_GET['id'] ?? 0);
$stmt = $slug
    ? db()->prepare("SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.slug = ? AND p.status = 'active'")
    : db()->prepare("SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ? AND p.status = 'active'");
$stmt->execute([$slug ?: $id]);
$product = $stmt->fetch();

if (!$product) {
    http_response_code(404);
    exit('Produto não encontrado.');
}

$relatedStmt = db()->prepare("SELECT * FROM products WHERE status = 'active' AND id <> ? ORDER BY created_at DESC LIMIT 3");
$relatedStmt->execute([(int) $product['id']]);
$related = $relatedStmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<section class="product-detail">
    <div class="detail-media">
        <img src="<?= e(product_image($product['image_url'])) ?>" alt="<?= e($product['name']) ?>">
        <div class="thumb-strip" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
        </div>
    </div>
    <div class="detail-copy">
        <div class="flex flex-wrap gap-2">
            <span class="pill"><?= e($product['category_name'] ?? $product['type']) ?></span>
            <span class="status-badge orange">digital</span>
            <span class="status-badge">exclusivo</span>
            <span class="status-badge red">CAFÉ STORE</span>
        </div>
        <h1><?= e($product['name']) ?></h1>
        <p class="muted text-lg"><?= nl2br(e($product['description'])) ?></p>
        <div class="price"><?= money((float) $product['price']) ?></div>
        <p class="stock">Estoque digital: <?= (int) $product['stock'] ?> unidades disponíveis</p>
        <form class="buy-box mt-6" action="<?= url('api/cart-add.php') ?>" method="post">
            <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
            <input type="number" name="quantity" value="1" min="1" max="<?= max(1, (int) $product['stock']) ?>" aria-label="Quantidade">
            <button class="btn primary" type="submit">Adicionar ao carrinho</button>
        </form>
    </div>
</section>

<?php if ($related): ?>
    <section class="section-head">
        <div>
            <p class="eyebrow">continue explorando</p>
            <h2>Produtos relacionados</h2>
        </div>
    </section>
    <div class="product-grid">
        <?php foreach ($related as $item): ?>
            <article class="product-card">
                <a href="<?= url('product.php?slug=' . urlencode($item['slug'])) ?>">
                    <img src="<?= e(product_image($item['image_url'])) ?>" alt="<?= e($item['name']) ?>">
                </a>
                <div>
                    <span class="pill"><?= e($item['type']) ?></span>
                    <h3><?= e($item['name']) ?></h3>
                    <p><?= e(excerpt($item['description'], 84)) ?></p>
                    <strong class="product-price text-2xl"><?= money((float) $item['price']) ?></strong>
                </div>
                <a class="btn ghost full" href="<?= url('product.php?slug=' . urlencode($item['slug'])) ?>">Ver produto</a>
            </article>
        <?php endforeach; ?>
    </div>
<?php endif; ?>
<?php include __DIR__ . '/includes/footer.php'; ?>
