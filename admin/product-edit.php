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
    $gallery = array_filter(array_map('trim', preg_split('/\R/', $_POST['gallery_images'] ?? '')));

    if ($name === '' || $price <= 0) {
        flash('error', 'Nome e preço são obrigatorios.');
    } else {
        $uploaded = product_upload_image_files($_FILES['product_images'] ?? [], $slug);
        $imageSet = product_normalize_image_set($mainImage, $gallery, $uploaded['images']);
        $mainImage = $imageSet['main'];

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
        $imageStmt = db()->prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)');
        foreach ($imageSet['gallery'] as $index => $imageUrl) {
            $imageStmt->execute([$id, $imageUrl, $index]);
        }
        foreach ($uploaded['errors'] as $uploadError) {
            flash('error', $uploadError);
        }
        flash('success', 'Produto atualizado.');
        redirect('admin/products.php');
    }
}
include __DIR__ . '/../includes/header.php';
?>
<div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[240px_1fr]">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="grid gap-5 min-w-0">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">edição</p>
        <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Editar produto</h1>
        <?php include __DIR__ . '/product-form.php'; ?>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
