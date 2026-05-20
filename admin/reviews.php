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
        flash('success', 'Avaliação excluida.');
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
<div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[240px_1fr]">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="grid gap-5 min-w-0">
        <div class="flex items-end justify-between gap-6">
            <div>
                <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">moderação</p>
                <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Avaliações</h1>
            </div>
        </div>

        <form class="glass flex flex-wrap items-center gap-3 p-4" method="get">
            <select name="status" class="input-field">
                <option value="" class="text-black">Todos os status</option>
                <?php foreach (['pending', 'approved', 'rejected'] as $item): ?>
                    <option value="<?= e($item) ?>" <?= $status === $item ? 'selected' : '' ?> class="text-black"><?= e($item) ?></option>
                <?php endforeach; ?>
            </select>
            <select name="product_id" class="input-field">
                <option value="0" class="text-black">Todos os produtos</option>
                <?php foreach ($products as $product): ?>
                    <option value="<?= (int) $product['id'] ?>" <?= $productId === (int) $product['id'] ? 'selected' : '' ?> class="text-black"><?= e($product['name']) ?></option>
                <?php endforeach; ?>
            </select>
            <button class="btn-secondary min-h-[44px]" type="submit">Filtrar</button>
        </form>

        <div class="grid gap-3">
            <?php foreach ($reviews as $review): ?>
                <?php
                $imgStmt = db()->prepare('SELECT image_url FROM review_images WHERE review_id = ? ORDER BY id');
                $imgStmt->execute([(int) $review['id']]);
                $images = $imgStmt->fetchAll();
                ?>
                <article class="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-lg">
                    <div class="grid gap-2">
                        <strong class="text-text-primary"><?= e($review['product_name']) ?></strong>
                        <small class="text-text-muted"><?= e($review['user_name']) ?> - <?= (int) $review['rating'] ?> estrelas - <?= e($review['status']) ?></small>
                        <p class="text-text-muted"><?= nl2br(e($review['comment'])) ?></p>
                        <?php foreach ($images as $image): ?>
                            <a href="<?= e(product_image($image['image_url'])) ?>" target="_blank" rel="noopener" class="text-amber-glow font-bold">Foto</a>
                        <?php endforeach; ?>
                    </div>
                    <form method="post" class="flex flex-wrap items-center gap-3 mt-3">
                        <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
                        <input type="hidden" name="review_id" value="<?= (int) $review['id'] ?>">
                        <button class="btn-primary min-h-[36px] px-3 text-[0.86rem]" name="action" value="approved" type="submit">Aprovar</button>
                        <button class="btn-secondary min-h-[36px] px-3 text-[0.86rem]" name="action" value="rejected" type="submit">Rejeitar</button>
                        <button class="border-0 bg-transparent cursor-pointer font-black text-state-error transition-all duration-300 hover:text-state-error/80 hover:drop-shadow-[0_0_10px_rgba(224,85,85,0.5)]" name="action" value="delete" type="submit">Excluir</button>
                    </form>
                </article>
            <?php endforeach; ?>
            <?php if (!$reviews): ?><p class="text-text-muted">Nenhuma avaliação encontrada.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
