<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();
$categories = db()->query('SELECT * FROM categories ORDER BY name')->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $slug = slugify($_POST['slug'] ?: $name);
    $price = max(0, (float) ($_POST['price'] ?? 0));
    $stock = max(0, (int) ($_POST['stock'] ?? 0));

    if ($name === '' || $price <= 0) {
        flash('error', 'Nome e preço são obrigatórios.');
    } else {
        $stmt = db()->prepare('INSERT INTO products (category_id, name, slug, description, price, image_url, stock, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            (int) ($_POST['category_id'] ?? 0) ?: null,
            $name,
            $slug,
            trim($_POST['description'] ?? ''),
            $price,
            trim($_POST['image_url'] ?? ''),
            $stock,
            $_POST['type'] ?? 'digital',
            $_POST['status'] ?? 'active',
        ]);
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
