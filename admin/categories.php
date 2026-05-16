<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        flash('error', 'Sessão expirada.');
        redirect('admin/categories.php');
    }

    $id = (int) ($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $slug = slugify($_POST['slug'] ?: $name);
    $action = $_POST['action'] ?? 'save';

    if ($action === 'delete' && $id > 0) {
        db()->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
        flash('success', 'Categoria excluída.');
        redirect('admin/categories.php');
    }

    if ($name === '') {
        flash('error', 'Informe o nome da categoria.');
    } elseif ($id > 0) {
        db()->prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?')->execute([$name, $slug, $id]);
        flash('success', 'Categoria atualizada.');
    } else {
        db()->prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')->execute([$name, $slug]);
        flash('success', 'Categoria criada.');
    }

    redirect('admin/categories.php');
}

$categories = db()->query('SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id ORDER BY c.name')->fetchAll();
include __DIR__ . '/../includes/header.php';
?>
<div class="admin-layout">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="admin-content">
        <div class="section-head compact">
            <div>
                <p class="eyebrow">catálogo</p>
                <h1>Categorias</h1>
            </div>
        </div>
        <form class="admin-card form-card" method="post">
            <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
            <label>Nome <input class="input-field" name="name" required></label>
            <label>Slug <input class="input-field" name="slug" placeholder="gerado automaticamente se vazio"></label>
            <button class="btn primary" type="submit">Criar categoria</button>
        </form>
        <div class="table-wrapper table admin-table">
            <?php foreach ($categories as $category): ?>
                <form class="table-row" method="post">
                    <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
                    <input type="hidden" name="id" value="<?= (int) $category['id'] ?>">
                    <input class="input-field" name="name" value="<?= e($category['name']) ?>">
                    <input class="input-field" name="slug" value="<?= e($category['slug']) ?>">
                    <span class="badge"><?= (int) $category['product_count'] ?> produtos</span>
                    <button class="btn small" name="action" value="save" type="submit">Salvar</button>
                    <button class="link-danger" name="action" value="delete" type="submit">Excluir</button>
                </form>
            <?php endforeach; ?>
            <?php if (!$categories): ?><p class="empty">Nenhuma categoria cadastrada.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
