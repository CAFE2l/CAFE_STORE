<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();
$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
$stmt->execute([$id]);
$product = $stmt->fetch();
if (!$product) {
    exit('Produto não encontrado.');
}
$categories = db()->query('SELECT * FROM categories ORDER BY name')->fetchAll();
$galleryStmt = db()->prepare('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order, id');
$galleryStmt->execute([$id]);
$galleryImagesText = implode("\n", array_column($galleryStmt->fetchAll(), 'image_url'));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        flash('error', 'Sessão expirada.');
        redirect('admin/product-edit.php?id=' . $id);
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
        $stmt = db()->prepare('UPDATE products SET category_id = ?, name = ?, slug = ?, description = ?, short_description = ?, price = ?, old_price = ?, image_url = ?, main_image_url = ?, stock = ?, type = ?, is_digital = ?, status = ? WHERE id = ?');
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
            $id,
        ]);
        db()->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$id]);
        $gallery = array_filter(array_map('trim', preg_split('/\R/', $_POST['gallery_images'] ?? '')));
        $imageStmt = db()->prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)');
        foreach (array_values($gallery) as $index => $imageUrl) {
            $imageStmt->execute([$id, $imageUrl, $index]);
        }
        flash('success', 'Produto atualizado.');
        redirect('admin/products.php');
    }
}
include __DIR__ . '/../includes/header.php';
?>
<div class="admin-layout">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="admin-content">
        <p class="eyebrow">edição</p>
        <h1>Editar produto</h1>
        <?php include __DIR__ . '/product-form.php'; ?>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
