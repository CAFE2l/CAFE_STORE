<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        flash('error', 'Sessão expirada.');
        redirect('admin/reviews.php');
    }

    $reviewId = (int) ($_POST['review_id'] ?? 0);
    $action = $_POST['action'] ?? '';

    if (in_array($action, ['approved', 'rejected'], true)) {
        $stmt = db()->prepare('UPDATE product_reviews SET status = ? WHERE id = ?');
        $stmt->execute([$action, $reviewId]);
        flash('success', 'Avaliação atualizada.');
    } elseif ($action === 'delete') {
        $stmt = db()->prepare('DELETE FROM product_reviews WHERE id = ?');
        $stmt->execute([$reviewId]);
        flash('success', 'Avaliação excluída.');
    }

    redirect('admin/reviews.php');
}

$status = $_GET['status'] ?? '';
$productId = (int) ($_GET['product_id'] ?? 0);
$where = [];
$params = [];
if (in_array($status, ['pending', 'approved', 'rejected'], true)) {
    $where[] = 'r.status = ?';
    $params[] = $status;
}
if ($productId > 0) {
    $where[] = 'r.product_id = ?';
    $params[] = $productId;
}

$sql = "SELECT r.*, p.name AS product_name, u.name AS user_name
        FROM product_reviews r
        JOIN products p ON p.id = r.product_id
        JOIN users u ON u.id = r.user_id";
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY r.created_at DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$reviews = $stmt->fetchAll();
$products = db()->query('SELECT id, name FROM products ORDER BY name')->fetchAll();

include __DIR__ . '/../includes/header.php';
?>
<div class="admin-layout">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="admin-content">
        <div class="section-head compact">
            <div>
                <p class="eyebrow">moderação</p>
                <h1>Avaliações</h1>
            </div>
        </div>

        <form class="admin-card form-card" method="get">
            <select name="status">
                <option value="">Todos os status</option>
                <?php foreach (['pending', 'approved', 'rejected'] as $item): ?>
                    <option value="<?= e($item) ?>" <?= $status === $item ? 'selected' : '' ?>><?= e($item) ?></option>
                <?php endforeach; ?>
            </select>
            <select name="product_id">
                <option value="0">Todos os produtos</option>
                <?php foreach ($products as $product): ?>
                    <option value="<?= (int) $product['id'] ?>" <?= $productId === (int) $product['id'] ? 'selected' : '' ?>><?= e($product['name']) ?></option>
                <?php endforeach; ?>
            </select>
            <button class="btn secondary" type="submit">Filtrar</button>
        </form>

        <div class="table-wrapper table admin-table">
            <?php foreach ($reviews as $review): ?>
                <?php
                $imgStmt = db()->prepare('SELECT image_url FROM review_images WHERE review_id = ? ORDER BY id');
                $imgStmt->execute([(int) $review['id']]);
                $images = $imgStmt->fetchAll();
                ?>
                <article class="table-row review-card">
                    <div>
                        <strong><?= e($review['product_name']) ?></strong>
                        <small><?= e($review['user_name']) ?> - <?= (int) $review['rating'] ?> estrelas - <?= e($review['status']) ?></small>
                        <p><?= nl2br(e($review['comment'])) ?></p>
                        <?php foreach ($images as $image): ?>
                            <a href="<?= e(product_image($image['image_url'])) ?>" target="_blank" rel="noopener">Foto</a>
                        <?php endforeach; ?>
                    </div>
                    <form method="post" class="inline-actions">
                        <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
                        <input type="hidden" name="review_id" value="<?= (int) $review['id'] ?>">
                        <button class="btn small" name="action" value="approved" type="submit">Aprovar</button>
                        <button class="btn small ghost" name="action" value="rejected" type="submit">Rejeitar</button>
                        <button class="link-danger" name="action" value="delete" type="submit">Excluir</button>
                    </form>
                </article>
            <?php endforeach; ?>
            <?php if (!$reviews): ?><p class="empty">Nenhuma avaliação encontrada.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
