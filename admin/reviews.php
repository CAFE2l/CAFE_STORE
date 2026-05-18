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
                <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">moderação</p>
                <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Avaliações</h1>
            </div>
        </div>

        <form class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg flex flex-wrap gap-3 items-center" method="get">
            <select name="status" class="min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400">
                <option value="" class="text-black">Todos os status</option>
                <?php foreach (['pending', 'approved', 'rejected'] as $item): ?>
                    <option value="<?= e($item) ?>" <?= $status === $item ? 'selected' : '' ?> class="text-black"><?= e($item) ?></option>
                <?php endforeach; ?>
            </select>
            <select name="product_id" class="min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400">
                <option value="0" class="text-black">Todos os produtos</option>
                <?php foreach ($products as $product): ?>
                    <option value="<?= (int) $product['id'] ?>" <?= $productId === (int) $product['id'] ? 'selected' : '' ?> class="text-black"><?= e($product['name']) ?></option>
                <?php endforeach; ?>
            </select>
            <button class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-glow-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]" type="submit">Filtrar</button>
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
                        <strong><?= e($review['product_name']) ?></strong>
                        <small class="text-midnight-400"><?= e($review['user_name']) ?> - <?= (int) $review['rating'] ?> estrelas - <?= e($review['status']) ?></small>
                        <p class="text-midnight-400"><?= nl2br(e($review['comment'])) ?></p>
                        <?php foreach ($images as $image): ?>
                            <a href="<?= e(product_image($image['image_url'])) ?>" target="_blank" rel="noopener" class="text-glow-400 font-bold">Foto</a>
                        <?php endforeach; ?>
                    </div>
                    <form method="post" class="flex flex-wrap items-center gap-3 mt-3">
                        <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
                        <input type="hidden" name="review_id" value="<?= (int) $review['id'] ?>">
                        <button class="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-3 text-[0.86rem] font-black leading-none text-midnight-950 transition-all duration-300 hover:bg-[100%_0] hover:scale-105" name="action" value="approved" type="submit">Aprovar</button>
                        <button class="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-3 text-[0.86rem] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-glow-400" name="action" value="rejected" type="submit">Rejeitar</button>
                        <button class="border-0 bg-transparent cursor-pointer font-black text-fire-300 transition-all duration-300 hover:text-fire-500 hover:drop-shadow-[0_0_10px_rgba(255,60,56,0.5)]" name="action" value="delete" type="submit">Excluir</button>
                    </form>
                </article>
            <?php endforeach; ?>
            <?php if (!$reviews): ?><p class="text-midnight-400">Nenhuma avaliação encontrada.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
