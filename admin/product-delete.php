<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();
$id = (int) ($_GET['id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        flash('error', 'Sessão expirada.');
        redirect('admin/products.php');
    }
    $stmt = db()->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);
    flash('success', 'Produto excluído.');
    redirect('admin/products.php');
}

$stmt = db()->prepare('SELECT id, name FROM products WHERE id = ?');
$stmt->execute([$id]);
$product = $stmt->fetch();
include __DIR__ . '/../includes/header.php';
?>
<div class="admin-layout">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="admin-content panel">
        <h1>Excluir produto</h1>
        <p>Confirma excluir <strong><?= e($product['name'] ?? 'produto') ?></strong>?</p>
        <form method="post">
            <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
            <button class="btn danger" type="submit">Excluir</button>
            <a class="btn ghost" href="<?= url('admin/products.php') ?>">Cancelar</a>
        </form>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
