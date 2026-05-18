<?php
require_once __DIR__ . '/config/helpers.php';

$slug = $_GET['slug'] ?? '';
$id = (int) ($_GET['id'] ?? 0);
$stmt = $slug
    ? db()->prepare("SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.slug = ? AND p.status = 'active'")
    : db()->prepare("SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ? AND p.status = 'active'");
$stmt->execute([$slug ?: $id]);
$product = $stmt->fetch();

if (!$product) {
    http_response_code(404);
    exit('Produto não encontrado.');
}

$relatedStmt = db()->prepare("SELECT * FROM products WHERE status = 'active' AND id <> ? ORDER BY created_at DESC LIMIT 3");
$relatedStmt->execute([(int) $product['id']]);
$related = $relatedStmt->fetchAll();

$imagesStmt = db()->prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, id');
$imagesStmt->execute([(int) $product['id']]);
$productImages = $imagesStmt->fetchAll();

$statsStmt = db()->prepare("SELECT COUNT(*) AS total, COALESCE(AVG(rating), 0) AS average_rating FROM product_reviews WHERE product_id = ? AND status = 'approved'");
$statsStmt->execute([(int) $product['id']]);
$reviewStats = $statsStmt->fetch();
$reviewCount = (int) ($reviewStats['total'] ?? 0);
$reviewAverage = (float) ($reviewStats['average_rating'] ?? 0);

$reviewsStmt = db()->prepare("SELECT r.*, u.name AS user_name FROM product_reviews r JOIN users u ON u.id = r.user_id WHERE r.product_id = ? AND r.status = 'approved' ORDER BY r.created_at DESC");
$reviewsStmt->execute([(int) $product['id']]);
$reviews = $reviewsStmt->fetchAll();
foreach ($reviews as &$review) {
    $imgStmt = db()->prepare('SELECT image_url FROM review_images WHERE review_id = ? ORDER BY id');
    $imgStmt->execute([(int) $review['id']]);
    $review['images'] = $imgStmt->fetchAll();
}
unset($review);

$myReview = null;
$isFavorite = false;
if (current_user()) {
    $myReviewStmt = db()->prepare('SELECT * FROM product_reviews WHERE product_id = ? AND user_id = ? LIMIT 1');
    $myReviewStmt->execute([(int) $product['id'], (int) $_SESSION['user_id']]);
    $myReview = $myReviewStmt->fetch() ?: null;

    $favoriteStmt = db()->prepare('SELECT id FROM favorites WHERE product_id = ? AND user_id = ? LIMIT 1');
    $favoriteStmt->execute([(int) $product['id'], (int) $_SESSION['user_id']]);
    $isFavorite = (bool) $favoriteStmt->fetchColumn();
}

include __DIR__ . '/includes/header.php';
?>
<div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[0.9fr_1.1fr]">
    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <img src="<?= e(product_main_image($product)) ?>" alt="<?= e($product['name']) ?>" class="aspect-square w-full rounded-[10px] bg-midnight-900 object-cover">
        <div class="mt-3 grid grid-cols-4 gap-2.5">
            <?php foreach ($productImages as $image): ?>
                <span class="aspect-square rounded-[10px] border border-white/10 bg-midnight-900"></span>
            <?php endforeach; ?>
        </div>
    </div>
    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg grid gap-4">
        <div class="flex flex-wrap gap-2">
            <span class="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400"><?= e($product['category_name'] ?? $product['type']) ?></span>
            <span class="inline-flex w-fit items-center justify-center rounded-full border border-ember-500/40 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-ember-300"><?= e(product_type_label($product['type'])) ?></span>
            <span class="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400">exclusivo</span>
            <span class="inline-flex w-fit items-center justify-center rounded-full border border-fire-500/40 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-fire-300">CAFÉ STORE</span>
        </div>
        <h1 class="m-0 text-[clamp(2.1rem,5vw,4rem)] font-black leading-tight tracking-tight bg-gradient-to-r from-ember-500 to-glow-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,107,0,0.8)]"><?= e($product['name']) ?></h1>
        <div class="flex items-center gap-2">
            <span class="text-glow-400"><?= str_repeat('★', (int) round($reviewAverage)) ?><?= str_repeat('☆', 5 - (int) round($reviewAverage)) ?></span>
            <small class="text-midnight-400"><?= (int) $reviewCount ?> avaliações</small>
        </div>
        <?php if (!empty($product['short_description'])): ?><p class="text-[1.125rem] leading-relaxed text-midnight-400"><?= e($product['short_description']) ?></p><?php endif; ?>
        <p class="m-0 text-[1.125rem] leading-relaxed text-midnight-400"><?= nl2br(e($product['description'])) ?></p>
        <div class="rounded-[10px] border border-glow-400/40 bg-glow-400/10 p-4">
            <strong class="block text-glow-400">Este item funciona como apoio/doação.</strong>
            <p class="mt-2 text-sm leading-relaxed text-midnight-300">Ao continuar, você entende que este valor apoia a CAFÉ STORE. Entrega física só será confirmada quando houver campanha oficial de produção e disponibilidade.</p>
        </div>
        <div class="text-[clamp(1.8rem,4vw,2.8rem)] font-black text-glow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><?= money((float) $product['price']) ?></div>
        <p class="text-midnight-400">Quantidade simbólica disponível: <?= (int) $product['stock'] ?> apoios</p>
        <div class="mt-6 flex items-center gap-3 flex-wrap">
            <form class="flex items-center gap-3 flex-wrap" action="<?= url('api/cart-add.php') ?>" method="post">
                <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                <input type="number" name="quantity" value="1" min="1" max="<?= max(1, (int) $product['stock']) ?>" aria-label="Quantidade" class="w-full min-h-[44px] max-w-[104px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.12),0_0_15px_rgba(255,215,0,0.1)]">
                <button class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)] animate-pulse-glow" type="submit">Adicionar apoio</button>
            </form>
            <form action="<?= url('api/wishlist-toggle.php') ?>" method="post">
                <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                <input type="hidden" name="redirect_to" value="product.php?slug=<?= e(urlencode($product['slug'])) ?>">
                <button class="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black text-white transition-all duration-300 hover:border-glow-400" type="submit"><?= $isFavorite ? 'Remover dos desejos' : 'Adicionar aos desejos' ?></button>
            </form>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/reviews/product-reviews.php'; ?>

<?php if ($related): ?>
    <div class="flex items-end justify-between gap-6 mb-6 mt-14">
        <div>
            <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">continue explorando</p>
            <h2 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight text-ember-400">Produtos relacionados</h2>
        </div>
    </div>
    <div class="grid gap-5 md:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-1">
        <?php foreach ($related as $item): ?>
            <article class="flex min-h-full flex-col gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2),0_0_30px_rgba(255,107,0,0.15)] hover:border-ember-500/30">
                <a href="<?= url('product.php?slug=' . urlencode($item['slug'])) ?>">
                    <div class="overflow-hidden rounded-[10px]">
                        <img src="<?= e(product_main_image($item)) ?>" alt="<?= e($item['name']) ?>" class="aspect-[4/3] w-full bg-midnight-900 object-cover transition-transform duration-500 hover:scale-110">
                    </div>
                </a>
                <div class="grid gap-2.5">
                    <span class="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400"><?= e(product_type_label($item['type'])) ?></span>
                    <h3 class="m-0 min-h-[2.7em] text-[1.02rem] font-black leading-tight"><?= e($item['name']) ?></h3>
                    <p class="m-0 min-h-[4.7em] text-[0.94rem] leading-relaxed text-midnight-400"><?= e(excerpt(($item['short_description'] ?? '') ?: $item['description'], 84)) ?></p>
                    <strong class="text-[1.5rem] font-black text-glow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><?= money((float) $item['price']) ?></strong>
                </div>
                <a class="mt-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-glow-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]" href="<?= url('product.php?slug=' . urlencode($item['slug'])) ?>">Ver produto</a>
            </article>
        <?php endforeach; ?>
    </div>
<?php endif; ?>
<?php include __DIR__ . '/includes/footer.php'; ?>
