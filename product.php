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

$reviewDistribution = array_fill(1, 5, 0);
foreach ($reviews as $review) {
    $ratingValue = max(1, min(5, (int) $review['rating']));
    $reviewDistribution[$ratingValue]++;
}

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

$mainImage = product_main_image($product);
$galleryItems = [[
    'label' => 'Frente',
    'src' => $mainImage,
]];
$galleryLabels = ['Costas', 'Detalhe', 'Tag', 'Veste', 'Flat lay'];
foreach ($productImages as $index => $image) {
    $galleryItems[] = [
        'label' => $galleryLabels[$index] ?? 'Foto ' . ($index + 2),
        'src' => product_image($image['image_url']),
    ];
}
$fallbackImages = [
    product_image('assets/produtos/camisas/camisaVtirine.png'),
    product_image('assets/produtos/camisas/camisaAlgodão.png'),
    product_image('assets/images/mascote.png'),
];
$fallbackIndex = 0;
while (count($galleryItems) < 6) {
    $galleryItems[] = [
        'label' => $galleryLabels[count($galleryItems) - 1] ?? 'Foto ' . (count($galleryItems) + 1),
        'src' => $fallbackImages[$fallbackIndex % count($fallbackImages)],
    ];
    $fallbackIndex++;
}
$galleryItems = array_slice($galleryItems, 0, 6);
$productSku = 'CAF-' . str_pad((string) $product['id'], 5, '0', STR_PAD_LEFT);
$stock = (int) $product['stock'];
$stockLabel = $stock <= 0 ? 'Esgotado' : ($stock <= 3 ? 'Últimas ' . $stock . ' unidades' : 'Em estoque');
$stockClass = $stock <= 0 ? 'text-red-300 border-red-500/40 bg-red-500/10' : ($stock <= 3 ? 'text-ember-300 border-ember-500/40 bg-ember-500/10' : 'text-glow-400 border-glow-400/40 bg-glow-400/10');
$oldPrice = (float) ($product['old_price'] ?? 0);
$currentPrice = (float) $product['price'];
$discountPercent = $oldPrice > $currentPrice && $oldPrice > 0 ? (int) round((1 - ($currentPrice / $oldPrice)) * 100) : 0;
$viewerCount = 8 + ((int) $product['id'] % 9);
$colors = [
    ['name' => 'Preto', 'hex' => '#050505', 'image' => $galleryItems[0]['src']],
    ['name' => 'Laranja', 'hex' => '#ff6b00', 'image' => $galleryItems[1]['src']],
    ['name' => 'Amarelo', 'hex' => '#ffd700', 'image' => $galleryItems[2]['src']],
    ['name' => 'Vermelho', 'hex' => '#ff2f2f', 'image' => $galleryItems[3]['src']],
];
$sizes = [
    ['label' => 'P', 'available' => $stock > 0],
    ['label' => 'M', 'available' => $stock > 0],
    ['label' => 'G', 'available' => $stock > 2],
    ['label' => 'GG', 'available' => $stock > 4],
    ['label' => 'XG', 'available' => false],
];

include __DIR__ . '/includes/header.php';
?>
<style>
.product-zoom-frame { cursor: zoom-in; }
.product-zoom-frame img { transform-origin: center; }
.product-thumb.is-active { border-color: rgba(255,215,0,.85); box-shadow: 0 0 0 3px rgba(255,215,0,.12), 0 14px 30px rgba(0,0,0,.35); }
.product-size.is-selected { border-color: #ffd700; color: #ffd700; background: rgba(255,215,0,.1); }
.product-color.is-selected { outline: 3px solid rgba(255,215,0,.36); outline-offset: 3px; }
.product-tab[open] summary { color: #ffd700; }
</style>

<section class="grid items-start gap-7 max-lg:grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.82fr)]">
    <div class="grid gap-4">
        <div class="rounded-2xl border border-white/10 bg-white/[0.045] p-3 backdrop-blur-lg shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
            <div class="product-zoom-frame relative overflow-hidden rounded-[14px] border border-white/10 bg-midnight-950" data-product-zoom>
                <img id="productMainImage" src="<?= e($galleryItems[0]['src']) ?>" alt="<?= e($product['name']) ?>" class="aspect-square w-full object-cover transition-transform duration-200">
                <span class="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-white backdrop-blur">zoom</span>
            </div>
        </div>
        <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <?php foreach ($galleryItems as $index => $image): ?>
                <button class="product-thumb <?= $index === 0 ? 'is-active' : '' ?> group overflow-hidden rounded-[12px] border border-white/10 bg-white/5 p-1 text-left transition-all hover:-translate-y-1 hover:border-glow-400" type="button" data-gallery-src="<?= e($image['src']) ?>">
                    <img src="<?= e($image['src']) ?>" alt="<?= e($image['label'] . ' - ' . $product['name']) ?>" class="aspect-square w-full rounded-[8px] object-cover">
                    <span class="mt-1 block truncate px-1 text-[0.68rem] font-black uppercase tracking-[0.08em] text-midnight-300"><?= e($image['label']) ?></span>
                </button>
            <?php endforeach; ?>
        </div>
        <div class="grid gap-4 md:grid-cols-[1fr_0.92fr]">
            <div class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-3 backdrop-blur-lg">
                <div class="relative aspect-video overflow-hidden rounded-[12px] bg-black">
                    <img src="<?= e($galleryItems[0]['src']) ?>" alt="Vídeo curto do produto" class="h-full w-full object-cover opacity-80 transition-transform duration-[6000ms] hover:scale-110">
                    <div class="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/60 via-transparent to-black/10">
                        <span class="grid h-14 w-14 place-items-center rounded-full border border-glow-400 bg-glow-400 text-xl font-black text-midnight-950 shadow-[0_0_26px_rgba(255,215,0,.38)]">▶</span>
                    </div>
                    <span class="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-black text-white backdrop-blur">Vídeo do produto 5-15s</span>
                </div>
            </div>
            <div class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-3 backdrop-blur-lg">
                <img src="<?= e($galleryItems[4]['src']) ?>" alt="Referência de tamanho com modelo" class="aspect-video w-full rounded-[12px] object-cover">
                <p class="mt-3 text-sm font-bold leading-relaxed text-midnight-300">Referência visual para entender proporção, caimento e tamanho antes de apoiar.</p>
            </div>
        </div>
    </div>

    <aside class="rounded-2xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl shadow-[0_18px_48px_rgba(0,0,0,0.28)] lg:sticky lg:top-24">
        <div class="flex flex-wrap gap-2">
            <span class="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400"><?= e($product['category_name'] ?? $product['type']) ?></span>
            <span class="inline-flex w-fit items-center justify-center rounded-full border border-ember-500/40 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-ember-300"><?= e(product_type_label($product['type'])) ?></span>
            <span class="inline-flex w-fit items-center justify-center rounded-full border px-[9px] py-[4px] text-[0.76rem] font-bold leading-none <?= e($stockClass) ?>"><?= e($stockLabel) ?></span>
            <span class="inline-flex w-fit items-center justify-center rounded-full border border-fire-500/40 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-fire-300">CAFÉ STORE</span>
        </div>
        <h1 class="mt-4 m-0 text-[clamp(2rem,4vw,3.6rem)] font-black leading-tight tracking-tight text-white"><?= e($product['name']) ?></h1>
        <div class="mt-3 flex flex-wrap items-center gap-3">
            <span class="text-lg text-glow-400"><?= str_repeat('★', (int) round($reviewAverage)) ?><?= str_repeat('☆', 5 - (int) round($reviewAverage)) ?></span>
            <a href="#avaliacoes" class="text-sm font-bold text-midnight-300 hover:text-glow-400"><?= number_format($reviewAverage, 1, ',', '.') ?> · <?= (int) $reviewCount ?> avaliações</a>
            <span class="text-sm font-bold text-midnight-500">SKU <?= e($productSku) ?></span>
        </div>
        <?php if (!empty($product['short_description'])): ?><p class="mt-4 text-[1.05rem] font-semibold leading-relaxed text-midnight-300"><?= e($product['short_description']) ?></p><?php endif; ?>
        <div class="rounded-[10px] border border-glow-400/40 bg-glow-400/10 p-4">
            <strong class="block text-glow-400">Este item funciona como apoio/doação.</strong>
            <p class="mt-2 text-sm leading-relaxed text-midnight-300">Ao continuar, você entende que este valor apoia a CAFÉ STORE. Entrega física só será confirmada quando houver campanha oficial de produção e disponibilidade.</p>
        </div>
        <div class="mt-5 flex flex-wrap items-end gap-3">
            <strong class="text-[clamp(2rem,4vw,3rem)] font-black text-glow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><?= money($currentPrice) ?></strong>
            <?php if ($oldPrice > $currentPrice): ?>
                <span class="pb-2 text-lg font-black text-midnight-500 line-through"><?= money($oldPrice) ?></span>
                <span class="mb-2 rounded-full border border-ember-500/40 bg-ember-500/10 px-3 py-1 text-xs font-black text-ember-300">-<?= $discountPercent ?>%</span>
            <?php endif; ?>
        </div>
        <div class="mt-5 grid gap-3">
            <div class="flex items-center justify-between gap-4">
                <strong class="text-sm uppercase tracking-[0.1em] text-midnight-300">Tamanho</strong>
                <button class="text-sm font-black text-glow-400 hover:text-white" type="button" data-size-guide>Guia de tamanhos</button>
            </div>
            <div class="flex flex-wrap gap-2">
                <?php foreach ($sizes as $index => $size): ?>
                    <button class="product-size min-h-[42px] min-w-[52px] rounded-[10px] border border-white/15 bg-white/5 px-4 font-black text-white transition-all disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through <?= $index === 1 && $size['available'] ? 'is-selected' : '' ?>" type="button" <?= $size['available'] ? '' : 'disabled' ?>><?= e($size['label']) ?></button>
                <?php endforeach; ?>
            </div>
        </div>
        <div class="mt-5 grid gap-3">
            <strong class="text-sm uppercase tracking-[0.1em] text-midnight-300">Cor</strong>
            <div class="flex flex-wrap gap-3">
                <?php foreach ($colors as $index => $color): ?>
                    <button class="product-color h-9 w-9 rounded-full border border-white/25 transition-transform hover:scale-110 <?= $index === 0 ? 'is-selected' : '' ?>" style="background: <?= e($color['hex']) ?>;" type="button" title="<?= e($color['name']) ?>" aria-label="<?= e($color['name']) ?>" data-variant-image="<?= e($color['image']) ?>"></button>
                <?php endforeach; ?>
            </div>
        </div>
        <form class="mt-6 grid gap-3" action="<?= url('api/cart-add.php') ?>" method="post">
            <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
            <div class="flex flex-wrap items-center gap-3">
                <div class="inline-flex min-h-[48px] items-center overflow-hidden rounded-[10px] border border-white/10 bg-midnight-950/80">
                    <button class="h-12 w-12 text-xl font-black text-white hover:bg-white/10" type="button" data-qty-minus>-</button>
                    <input id="productQuantity" type="number" name="quantity" value="1" min="1" max="<?= max(1, $stock) ?>" aria-label="Quantidade" class="h-12 w-16 border-x border-white/10 bg-transparent text-center font-black text-white outline-none">
                    <button class="h-12 w-12 text-xl font-black text-white hover:bg-white/10" type="button" data-qty-plus>+</button>
                </div>
                <span class="text-sm font-bold text-midnight-300"><?= $stock > 0 ? 'Apenas ' . max(1, min(4, $stock)) . ' restantes!' : 'Produto esgotado' ?></span>
                <span class="text-sm font-bold text-midnight-400"><?= $viewerCount ?> pessoas vendo agora</span>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
                <button class="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,107,0,0.55)] disabled:opacity-40" type="submit" name="redirect_to" value="cart.php" <?= $stock <= 0 ? 'disabled' : '' ?>>Adicionar ao carrinho</button>
                <button class="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:border-glow-400" type="submit" name="redirect_to" value="checkout.php" <?= $stock <= 0 ? 'disabled' : '' ?>>Comprar agora</button>
            </div>
        </form>
        <div class="mt-3 flex flex-wrap gap-3">
            <form action="<?= url('api/wishlist-toggle.php') ?>" method="post">
                <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                <input type="hidden" name="redirect_to" value="product.php?slug=<?= e(urlencode($product['slug'])) ?>">
                <button class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[16px] font-black text-white transition-all duration-300 hover:border-glow-400" type="submit"><?= $isFavorite ? '♥ Remover' : '♡ Favoritar' ?></button>
            </form>
            <button class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[16px] font-black text-white transition-all duration-300 hover:border-glow-400" type="button" data-share-product>Compartilhar</button>
        </div>
    </aside>
</section>

<section class="mt-12 grid gap-4 lg:grid-cols-[1fr_0.82fr]">
    <div class="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-lg">
        <details class="product-tab border-b border-white/10 py-4" open>
            <summary class="cursor-pointer text-lg font-black text-white">Descrição e benefícios</summary>
            <p class="mt-3 text-midnight-300 leading-relaxed"><?= nl2br(e($product['description'])) ?></p>
        </details>
        <details class="product-tab border-b border-white/10 py-4">
            <summary class="cursor-pointer text-lg font-black text-white">Composição e cuidados</summary>
            <div class="mt-3 grid gap-2 text-midnight-300">
                <p><strong class="text-white">Material:</strong> algodão premium 30.1, toque macio e boa durabilidade.</p>
                <p><strong class="text-white">Lavagem:</strong> lavar do avesso, água fria, não usar alvejante e secar à sombra.</p>
                <p><strong class="text-white">Estampa:</strong> criada para uso casual e visual limpo da CAFÉ STORE.</p>
            </div>
        </details>
        <details class="product-tab py-4" id="guia-tamanhos">
            <summary class="cursor-pointer text-lg font-black text-white">Tabela de medidas</summary>
            <div class="mt-3 overflow-x-auto">
                <table class="w-full min-w-[520px] text-left text-sm">
                    <thead class="text-midnight-400"><tr><th class="py-2">Tamanho</th><th>Largura</th><th>Comprimento</th><th>Manga</th></tr></thead>
                    <tbody class="divide-y divide-white/10 text-midnight-300">
                        <tr><td class="py-2 font-black text-white">P</td><td>49 cm</td><td>68 cm</td><td>20 cm</td></tr>
                        <tr><td class="py-2 font-black text-white">M</td><td>52 cm</td><td>71 cm</td><td>21 cm</td></tr>
                        <tr><td class="py-2 font-black text-white">G</td><td>55 cm</td><td>74 cm</td><td>22 cm</td></tr>
                        <tr><td class="py-2 font-black text-white">GG</td><td>58 cm</td><td>77 cm</td><td>23 cm</td></tr>
                    </tbody>
                </table>
            </div>
        </details>
    </div>
    <div class="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-lg">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">perguntas frequentes</p>
        <?php foreach ([
            'Esse produto é físico?' => 'No momento, esta página funciona como apoio/doação. Produtos físicos serão liberados em campanha oficial com entrega no Brasil.',
            'Quando recebo se houver produção?' => 'Prazo, transportadora e disponibilidade serão informados antes da compra real de produto físico.',
            'Posso trocar tamanho ou cor?' => 'Em campanha oficial, as regras de troca serão exibidas antes do pagamento.',
        ] as $question => $answer): ?>
            <details class="product-tab border-b border-white/10 py-3">
                <summary class="cursor-pointer font-black text-white"><?= e($question) ?></summary>
                <p class="mt-2 text-sm leading-relaxed text-midnight-300"><?= e($answer) ?></p>
            </details>
        <?php endforeach; ?>
        <label class="mt-4 grid gap-2 text-sm font-black text-midnight-300">Fazer uma pergunta
            <textarea class="min-h-[96px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-3 text-white outline-none focus:border-glow-400" placeholder="Digite sua pergunta para o vendedor"></textarea>
        </label>
        <button class="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-[10px] border border-white/20 bg-white/5 px-4 font-black text-white hover:border-glow-400" type="button">Enviar pergunta</button>
    </div>
</section>

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
<script>
(() => {
    const mainImage = document.getElementById('productMainImage');
    const thumbs = document.querySelectorAll('[data-gallery-src]');
    const zoomFrame = document.querySelector('[data-product-zoom]');
    const quantity = document.getElementById('productQuantity');
    const maxQuantity = quantity ? Number(quantity.max || 99) : 99;

    const setMainImage = (src) => {
        if (!mainImage || !src) return;
        mainImage.src = src;
    };

    thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
            thumbs.forEach((item) => item.classList.remove('is-active'));
            thumb.classList.add('is-active');
            setMainImage(thumb.dataset.gallerySrc);
        });
    });

    document.querySelectorAll('.product-color').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.product-color').forEach((item) => item.classList.remove('is-selected'));
            button.classList.add('is-selected');
            setMainImage(button.dataset.variantImage);
        });
    });

    document.querySelectorAll('.product-size:not(:disabled)').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.product-size').forEach((item) => item.classList.remove('is-selected'));
            button.classList.add('is-selected');
        });
    });

    if (zoomFrame && mainImage) {
        zoomFrame.addEventListener('mousemove', (event) => {
            const rect = zoomFrame.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            mainImage.style.transformOrigin = `${x}% ${y}%`;
            mainImage.style.transform = 'scale(1.75)';
        });
        zoomFrame.addEventListener('mouseleave', () => {
            mainImage.style.transformOrigin = 'center';
            mainImage.style.transform = 'scale(1)';
        });
    }

    document.querySelector('[data-qty-minus]')?.addEventListener('click', () => {
        if (!quantity) return;
        quantity.value = Math.max(1, Number(quantity.value || 1) - 1);
    });
    document.querySelector('[data-qty-plus]')?.addEventListener('click', () => {
        if (!quantity) return;
        quantity.value = Math.min(maxQuantity, Number(quantity.value || 1) + 1);
    });

    document.querySelector('[data-share-product]')?.addEventListener('click', async () => {
        const shareData = { title: document.title, url: window.location.href };
        if (navigator.share) {
            await navigator.share(shareData);
            return;
        }
        await navigator.clipboard.writeText(window.location.href);
        window.dispatchEvent(new CustomEvent('toast', { detail: 'Link copiado.' }));
    });

    document.querySelector('[data-size-guide]')?.addEventListener('click', () => {
        const guide = document.getElementById('guia-tamanhos');
        if (!guide) return;
        guide.open = true;
        guide.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
})();
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>
