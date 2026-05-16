<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();
$categories = db()->query('SELECT * FROM categories ORDER BY name')->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        flash('error', 'Sessão expirada.');
        redirect('admin/product-create.php');
    }
    $name = trim($_POST['name'] ?? '');
    $slug = slugify($_POST['slug'] ?: $name);
    $price = max(0, (float) ($_POST['price'] ?? 0));
    $oldPrice = trim($_POST['old_price'] ?? '') === '' ? null : max(0, (float) $_POST['old_price']);
    $stock = max(0, (int) ($_POST['stock'] ?? 0));
    $mainImage = trim($_POST['main_image_url'] ?? '');

    if ($name === '' || $price <= 0) {
        flash('error', 'Nome e preço são obrigatórios.');
    } else {
        $stmt = db()->prepare('INSERT INTO products (category_id, name, slug, description, short_description, price, old_price, image_url, main_image_url, stock, type, is_digital, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            (int) ($_POST['category_id'] ?? 0) ?: null,
            $name,
            $slug,
            trim($_POST['description'] ?? ''),
            trim($_POST['short_description'] ?? ''),
            $price,
            $oldPrice,
            $mainImage,
            $mainImage,
            $stock,
            $_POST['type'] ?? 'digital',
            isset($_POST['is_digital']) ? 1 : 0,
            $_POST['status'] ?? 'active',
        ]);
        $productId = (int) db()->lastInsertId();
        $gallery = array_filter(array_map('trim', preg_split('/\R/', $_POST['gallery_images'] ?? '')));
        $imageStmt = db()->prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)');
        foreach (array_values($gallery) as $index => $imageUrl) {
            $imageStmt->execute([$productId, $imageUrl, $index]);
        }
        flash('success', 'Produto criado.');
        redirect('admin/products.php');
    }
}
include __DIR__ . '/../includes/header.php';
?>
<div class="admin-layout">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="admin-content">
        <p class="eyebrow">cadastro</p>
        <h1>Novo produto</h1>
        <?php include __DIR__ . '/product-form.php'; ?>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
