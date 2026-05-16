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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $slug = slugify($_POST['slug'] ?: $name);
    $price = max(0, (float) ($_POST['price'] ?? 0));
    $stock = max(0, (int) ($_POST['stock'] ?? 0));

    if ($name === '' || $price <= 0) {
        flash('error', 'Nome e preço são obrigatórios.');
    } else {
        $stmt = db()->prepare('UPDATE products SET category_id = ?, name = ?, slug = ?, description = ?, price = ?, image_url = ?, stock = ?, type = ?, status = ? WHERE id = ?');
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
            $id,
        ]);
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
