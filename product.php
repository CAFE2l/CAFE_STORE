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

$productIdentity = strtolower(($product['slug'] ?? '') . ' ' . ($product['name'] ?? '') . ' ' . ($product['category_name'] ?? ''));
$isKeychain = strpos($productIdentity, 'chaveiro') !== false;
$variantBaseDir = null;
if (strpos($productIdentity, 'poliester') !== false || strpos($productIdentity, 'poliéster') !== false) {
    $variantBaseDir = 'poliester';
} elseif (strpos($productIdentity, 'caneca') !== false) {
    $variantBaseDir = 'caneca';
} elseif (strpos($productIdentity, 'camiseta') !== false) {
    $variantBaseDir = 'camisa_normal';
}

$imageRatioForPath = static function ($path) {
    $relativePath = ltrim((string) (parse_url((string) $path, PHP_URL_PATH) ?: $path), '/');
    $absolutePath = __DIR__ . '/' . $relativePath;

    if (!is_file($absolutePath)) {
        return '16 / 9';
    }

    $size = @getimagesize($absolutePath);
    if (!$size || empty($size[0]) || empty($size[1])) {
        return '16 / 9';
    }

    return ((int) $size[0]) . ' / ' . ((int) $size[1]);
};

$buildGalleryFromPaths = static function (array $paths) use ($product, $imageRatioForPath) {
    $labels = ['Frente', 'Costas', 'Detalhe', 'Tag'];
    $items = [];
    foreach (array_values(array_unique(array_filter($paths))) as $index => $path) {
        $items[] = [
            'label' => $labels[$index] ?? 'Foto ' . ($index + 1),
            'src' => product_image($path),
            'raw' => $path,
            'ratio' => $imageRatioForPath($path),
        ];
        if (count($items) >= 4) {
            break;
        }
    }

    if (!$items) {
        $items[] = [
            'label' => 'Frente',
            'src' => product_main_image($product),
            'raw' => $product['main_image_url'] ?? $product['image_url'] ?? '',
            'ratio' => $imageRatioForPath($product['main_image_url'] ?? $product['image_url'] ?? ''),
        ];
    }

    return $items;
};

$variantGalleries = [];
if (!$isKeychain && $variantBaseDir) {
    foreach (['preta' => 'Preto', 'branca' => 'Branco'] as $variantDir => $variantName) {
        $absoluteDir = __DIR__ . '/assets/images/produtos/' . $variantBaseDir . '/' . $variantDir;
        if (!is_dir($absoluteDir)) {
            continue;
        }

        $preferred = ['design', 'banner', 'frente', 'tras', 'verso', 'camisaVtirine', 'camisa_tras'];
        $paths = [];
        foreach ($preferred as $basename) {
            foreach (glob($absoluteDir . '/' . $basename . '.*') ?: [] as $file) {
                $paths[] = 'assets/images/produtos/' . $variantBaseDir . '/' . $variantDir . '/' . basename($file);
            }
        }
        foreach (glob($absoluteDir . '/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', GLOB_BRACE) ?: [] as $file) {
            $paths[] = 'assets/images/produtos/' . $variantBaseDir . '/' . $variantDir . '/' . basename($file);
        }

        $variantGalleries[$variantDir] = [
            'name' => $variantName,
            'hex' => $variantDir === 'preta' ? '#050505' : '#f8fafc',
            'items' => $buildGalleryFromPaths($paths),
        ];
    }
}

if ($variantGalleries) {
    $firstVariantGallery = reset($variantGalleries);
    $galleryItems = $variantGalleries['preta']['items'] ?? $firstVariantGallery['items'];
} else {
    $mainImage = product_main_image($product);
    $galleryPaths = [$product['main_image_url'] ?? $product['image_url'] ?? $mainImage];
    foreach ($productImages as $image) {
        $galleryPaths[] = $image['image_url'];
    }
    $galleryItems = $buildGalleryFromPaths($galleryPaths);
}

$galleryImage = static function ($index) use ($galleryItems) {
    return $galleryItems[$index]['src'] ?? $galleryItems[0]['src'];
};
$productSku = 'CAF-' . str_pad((string) $product['id'], 5, '0', STR_PAD_LEFT);
$stock = (int) $product['stock'];
$stockLabel = $stock <= 0 ? 'Esgotado' : ($stock <= 3 ? 'Últimas ' . $stock . ' unidades' : 'Em estoque');
$stockClass = $stock <= 0 ? 'text-red-300 border-red-500/40 bg-red-500/10' : ($stock <= 3 ? 'text-amber-glow border-amber-accent/40 bg-amber-accent/10' : 'text-amber-glow border-amber-accent/40 bg-amber-accent/10');
$oldPrice = (float) ($product['old_price'] ?? 0);
$currentPrice = (float) $product['price'];
$discountPercent = $oldPrice > $currentPrice && $oldPrice > 0 ? (int) round((1 - ($currentPrice / $oldPrice)) * 100) : 0;
$viewerCount = 8 + ((int) $product['id'] % 9);
$colors = $isKeychain
    ? [['name' => 'Modelo único', 'hex' => '#050505', 'image' => $galleryImage(0)]]
    : array_map(static function ($gallery) {
        return [
            'name' => $gallery['name'],
            'hex' => $gallery['hex'],
            'image' => $gallery['items'][0]['src'],
            'items' => $gallery['items'],
        ];
    }, array_values($variantGalleries));
$sizes = [
    ['label' => 'P', 'available' => $stock > 0],
    ['label' => 'M', 'available' => $stock > 0],
    ['label' => 'G', 'available' => $stock > 2],
    ['label' => 'GG', 'available' => $stock > 4],
    ['label' => 'XG', 'available' => false],
];

include __DIR__ . '/includes/header.php';
?>

<section class="grid items-start gap-7 max-lg:grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.82fr)]">
    <div class="grid gap-4">
        <div class="product-premium-panel rounded-2xl p-3 shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
            <div class="product-zoom-frame relative overflow-hidden rounded-[14px] border border-white/10 bg-background" data-product-zoom>
                <img id="productMainImage" src="<?= e($galleryItems[0]['src']) ?>" alt="<?= e($product['name']) ?>" class="product-detail-main-image w-full bg-background object-contain transition-transform duration-200">
                <span class="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-white backdrop-blur">clique para ampliar</span>
                <span class="product-zoom-lens" aria-hidden="true"></span>
            </div>
        </div>
        <div class="grid grid-cols-3 gap-3 sm:grid-cols-6" data-gallery-list>
            <?php foreach ($galleryItems as $index => $image): ?>
                <button class="product-thumb <?= $index === 0 ? 'is-active' : '' ?> group overflow-hidden rounded-[12px] border border-white/10 bg-white/5 p-1 text-left transition-all hover:-translate-y-1 hover:border-amber-accent" type="button" data-gallery-src="<?= e($image['src']) ?>">
                    <img src="<?= e($image['src']) ?>" alt="<?= e($image['label'] . ' - ' . $product['name']) ?>" class="product-thumb-image aspect-square w-full rounded-[8px] bg-background">
                    <span class="mt-1 block truncate px-1 text-[0.68rem] font-black uppercase tracking-[0.08em] text-text-secondary"><?= e($image['label']) ?></span>
                </button>
            <?php endforeach; ?>
        </div>
        <div class="grid gap-4 md:grid-cols-[1fr_0.92fr]">
            <div class="overflow-hidden product-premium-panel rounded-2xl p-3">
                <div class="relative aspect-video overflow-hidden rounded-[12px] bg-black">
                    <img src="<?= e($galleryItems[0]['src']) ?>" alt="Vídeo curto do produto" class="h-full w-full object-contain opacity-80 transition-transform duration-[6000ms] hover:scale-105" data-product-video-image>
                    <div class="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/60 via-transparent to-black/10">
                        <span class="grid h-14 w-14 place-items-center rounded-full border border-amber-accent bg-amber-accent text-xl font-black text-background shadow-[0_0_26px_rgba(255,215,0,.38)]">▶</span>
                    </div>
                    <span class="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-black text-white backdrop-blur">Vídeo do produto 5-15s</span>
                </div>
            </div>
            <div class="overflow-hidden product-premium-panel rounded-2xl p-3">
                <img src="<?= e($galleryImage(min(3, count($galleryItems) - 1))) ?>" alt="Referência de tamanho com modelo" class="aspect-video w-full rounded-[12px] bg-background object-contain" data-product-reference-image>
                <p class="mt-3 text-sm font-bold leading-relaxed text-text-secondary">Referência visual para entender proporção, caimento e tamanho antes de apoiar.</p>
            </div>
        </div>
    </div>

    <div class="product-detail-side grid gap-4" data-product-side>
    <div class="product-zoom-panel" data-zoom-panel aria-hidden="true"></div>
    <aside class="product-summary-card rounded-2xl p-5 lg:sticky lg:top-24">
        <div class="flex flex-wrap gap-2">
            <span class="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-amber-glow"><?= e($product['category_name'] ?? $product['type']) ?></span>
            <span class="inline-flex w-fit items-center justify-center rounded-full border border-amber-accent/40 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-amber-glow"><?= e(product_type_label($product['type'])) ?></span>
            <span class="inline-flex w-fit items-center justify-center rounded-full border px-[9px] py-[4px] text-[0.76rem] font-bold leading-none <?= e($stockClass) ?>"><?= e($stockLabel) ?></span>
            <span class="inline-flex w-fit items-center justify-center rounded-full border border-state-error/40 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-state-error">CAFÉ STORE</span>
        </div>
        <h1 class="mt-4 m-0 font-display text-[clamp(2rem,4vw,3.6rem)] font-black leading-tight tracking-tight text-white"><?= e($product['name']) ?></h1>
        <div class="mt-3 flex flex-wrap items-center gap-3">
            <span class="text-lg text-amber-glow"><?= str_repeat('★', (int) round($reviewAverage)) ?><?= str_repeat('☆', 5 - (int) round($reviewAverage)) ?></span>
            <a href="#avaliacoes" class="text-sm font-bold text-text-secondary hover:text-amber-glow"><?= number_format($reviewAverage, 1, ',', '.') ?> · <?= (int) $reviewCount ?> avaliações</a>
            <span class="text-sm font-bold text-text-muted">SKU <?= e($productSku) ?></span>
        </div>
        <?php if (!empty($product['short_description'])): ?><p class="mt-4 text-[1.05rem] font-semibold leading-relaxed text-text-secondary"><?= e($product['short_description']) ?></p><?php endif; ?>
        <div class="rounded-[10px] border border-amber-accent/40 bg-amber-accent/10 p-4">
            <strong class="block text-amber-glow">Este item funciona como apoio/doação.</strong>
            <p class="mt-2 text-sm leading-relaxed text-text-secondary">Ao continuar, você entende que este valor apoia a CAFÉ STORE. Entrega física só será confirmada quando houver campanha oficial de produção e disponibilidade.</p>
        </div>
        <div class="mt-5 flex flex-wrap items-end gap-3">
            <strong class="font-mono text-[clamp(2rem,4vw,3rem)] font-black text-amber-glow text-glow"><?= money($currentPrice) ?></strong>
            <?php if ($oldPrice > $currentPrice): ?>
                <span class="pb-2 text-lg font-black text-text-muted line-through"><?= money($oldPrice) ?></span>
                <span class="mb-2 rounded-full border border-amber-accent/40 bg-amber-accent/10 px-3 py-1 text-xs font-black text-amber-glow">-<?= $discountPercent ?>%</span>
            <?php endif; ?>
        </div>
        <div class="mt-5 grid gap-3">
            <div class="flex items-center justify-between gap-4">
                <strong class="text-sm uppercase tracking-[0.1em] text-text-secondary">Tamanho</strong>
                <button class="text-sm font-black text-amber-glow hover:text-white" type="button" data-size-guide>Guia de tamanhos</button>
            </div>
            <div class="flex flex-wrap gap-2">
                <?php foreach ($sizes as $index => $size): ?>
                    <button class="product-size min-h-[42px] min-w-[52px] rounded-[10px] border border-white/15 bg-white/5 px-4 font-black text-white transition-all disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through <?= $index === 1 && $size['available'] ? 'is-selected' : '' ?>" type="button" <?= $size['available'] ? '' : 'disabled' ?>><?= e($size['label']) ?></button>
                <?php endforeach; ?>
            </div>
        </div>
        <?php if ($isKeychain || $colors): ?>
        <div class="mt-5 grid gap-3">
            <strong class="text-sm uppercase tracking-[0.1em] text-text-secondary"><?= $isKeychain ? 'Modelo' : 'Cor' ?></strong>
            <?php if ($isKeychain): ?>
                <span class="inline-flex min-h-[38px] w-fit items-center justify-center rounded-[10px] border border-amber-accent/40 bg-amber-accent/10 px-4 text-sm font-black text-amber-glow">Modelo único</span>
            <?php else: ?>
                <div class="flex flex-wrap gap-3">
                    <?php foreach ($colors as $index => $color): ?>
                        <button class="product-color h-9 w-9 rounded-full border border-white/25 transition-transform hover:scale-110 <?= $index === 0 ? 'is-selected' : '' ?>" style="background: <?= e($color['hex']) ?>;" type="button" title="<?= e($color['name']) ?>" aria-label="<?= e($color['name']) ?>" data-variant-image="<?= e($color['image']) ?>" data-variant-gallery='<?= e(json_encode($color['items'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) ?>'></button>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>
        <form class="mt-6 grid gap-3" action="<?= url('api/cart-add.php') ?>" method="post">
            <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
            <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
            <div class="flex flex-wrap items-center gap-3">
                <div class="inline-flex items-center gap-1 rounded-[14px] border border-white/10 bg-black/35 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_12px_28px_rgba(0,0,0,.25)]">
                    <button class="grid h-11 w-11 place-items-center rounded-[10px] text-xl font-black leading-none text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-accent/70" type="button" data-qty-minus aria-label="Diminuir quantidade">-</button>
                    <input id="productQuantity" type="number" name="quantity" value="1" min="1" max="<?= max(1, $stock) ?>" aria-label="Quantidade" class="product-quantity-input h-11 w-14 rounded-[10px] border border-white/10 bg-white/5 text-center text-lg font-black text-white outline-none focus:border-amber-accent focus:bg-white/10">
                    <button class="grid h-11 w-11 place-items-center rounded-[10px] text-xl font-black leading-none text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-accent/70" type="button" data-qty-plus aria-label="Aumentar quantidade">+</button>
                </div>
                <span class="text-sm font-bold text-text-secondary"><?= $stock > 0 ? 'Apenas ' . max(1, min(4, $stock)) . ' restantes!' : 'Produto esgotado' ?></span>
                <span class="text-sm font-bold text-text-secondary"><?= $viewerCount ?> pessoas vendo agora</span>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
                <button class="btn-primary min-h-[50px] disabled:opacity-40" type="submit" name="redirect_to" value="cart.php" <?= $stock <= 0 ? 'disabled' : '' ?>>Adicionar ao carrinho</button>
                <button class="btn-secondary min-h-[50px]" type="submit" name="redirect_to" value="checkout.php" <?= $stock <= 0 ? 'disabled' : '' ?>>Comprar agora</button>
            </div>
        </form>
        <div class="mt-3 flex flex-wrap gap-3">
            <form action="<?= url('api/wishlist-toggle.php') ?>" method="post">
                <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                <input type="hidden" name="redirect_to" value="product.php?slug=<?= e(urlencode($product['slug'])) ?>">
                <button class="btn-secondary min-h-[44px] px-4 py-2" type="submit"><?= $isFavorite ? '♥ Remover' : '♡ Favoritar' ?></button>
            </form>
            <button class="btn-secondary min-h-[44px] px-4 py-2" type="button" data-share-product>Compartilhar</button>
        </div>
    </aside>
    </div>
</section>

<section class="mt-12 grid gap-4 lg:grid-cols-[1fr_0.82fr]">
    <div class="product-premium-panel rounded-2xl p-5">
        <details class="product-tab border-b border-white/10 py-4" open>
            <summary class="cursor-pointer text-lg font-black text-white">Descrição e benefícios</summary>
            <p class="mt-3 text-text-secondary leading-relaxed"><?= nl2br(e($product['description'])) ?></p>
        </details>
        <details class="product-tab border-b border-white/10 py-4">
            <summary class="cursor-pointer text-lg font-black text-white">Composição e cuidados</summary>
            <div class="mt-3 grid gap-2 text-text-secondary">
                <p><strong class="text-white">Material:</strong> algodão premium 30.1, toque macio e boa durabilidade.</p>
                <p><strong class="text-white">Lavagem:</strong> lavar do avesso, água fria, não usar alvejante e secar à sombra.</p>
                <p><strong class="text-white">Estampa:</strong> criada para uso casual e visual limpo da CAFÉ STORE.</p>
            </div>
        </details>
        <details class="product-tab py-4" id="guia-tamanhos">
            <summary class="cursor-pointer text-lg font-black text-white">Tabela de medidas</summary>
            <div class="mt-3 overflow-x-auto">
                <table class="w-full min-w-[520px] text-left text-sm">
                    <thead class="text-text-secondary"><tr><th class="py-2">Tamanho</th><th>Largura</th><th>Comprimento</th><th>Manga</th></tr></thead>
                    <tbody class="divide-y divide-white/10 text-text-secondary">
                        <tr><td class="py-2 font-black text-white">P</td><td>49 cm</td><td>68 cm</td><td>20 cm</td></tr>
                        <tr><td class="py-2 font-black text-white">M</td><td>52 cm</td><td>71 cm</td><td>21 cm</td></tr>
                        <tr><td class="py-2 font-black text-white">G</td><td>55 cm</td><td>74 cm</td><td>22 cm</td></tr>
                        <tr><td class="py-2 font-black text-white">GG</td><td>58 cm</td><td>77 cm</td><td>23 cm</td></tr>
                    </tbody>
                </table>
            </div>
        </details>
    </div>
    <div class="product-premium-panel rounded-2xl p-5">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">perguntas frequentes</p>
        <?php foreach ([
            'Esse produto é físico?' => 'No momento, esta página funciona como apoio/doação. Produtos físicos serão liberados em campanha oficial com entrega no Brasil.',
            'Quando recebo se houver produção?' => 'Prazo, transportadora e disponibilidade serão informados antes da compra real de produto físico.',
            'Posso trocar tamanho ou cor?' => 'Em campanha oficial, as regras de troca serão exibidas antes do pagamento.',
        ] as $question => $answer): ?>
            <details class="product-tab border-b border-white/10 py-3">
                <summary class="cursor-pointer font-black text-white"><?= e($question) ?></summary>
                <p class="mt-2 text-sm leading-relaxed text-text-secondary"><?= e($answer) ?></p>
            </details>
        <?php endforeach; ?>
        <label class="mt-4 grid gap-2 text-sm font-black text-text-secondary">Fazer uma pergunta
            <textarea class="min-h-[96px] rounded-[10px] border border-white/10 bg-background/80 p-3 text-white outline-none focus:border-amber-accent" placeholder="Digite sua pergunta para o vendedor"></textarea>
        </label>
        <button class="btn-secondary mt-3 min-h-[42px] px-4 py-2" type="button">Enviar pergunta</button>
    </div>
</section>

<div class="product-image-modal" data-image-modal aria-hidden="true">
    <button class="inline-flex min-h-[42px] items-center justify-center rounded-[10px] border border-white/20 bg-white/10 px-4 font-black text-white backdrop-blur hover:border-amber-accent" type="button" data-image-modal-close>Fechar</button>
    <img src="<?= e($galleryItems[0]['src']) ?>" alt="<?= e($product['name']) ?>" data-image-modal-img>
</div>

<?php include __DIR__ . '/includes/reviews/product-reviews.php'; ?>

<?php if ($related): ?>
    <div class="flex items-end justify-between gap-6 mb-6 mt-14">
        <div>
            <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">continue explorando</p>
            <h2 class="product-section-title m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight gradient-text">Produtos relacionados</h2>
        </div>
    </div>
    <div class="grid gap-5 md:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-1">
        <?php foreach ($related as $item): ?>
            <article class="card-product flex min-h-full flex-col gap-3.5 p-3.5">
                <a href="<?= url('product.php?slug=' . urlencode($item['slug'])) ?>">
                    <div class="overflow-hidden rounded-[10px]">
                        <img src="<?= e(product_main_image($item)) ?>" alt="<?= e($item['name']) ?>" class="aspect-[4/3] w-full bg-background-surface object-cover transition-transform duration-500 hover:scale-110">
                    </div>
                </a>
                <div class="grid gap-2.5">
                    <span class="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-amber-glow"><?= e(product_type_label($item['type'])) ?></span>
                    <h3 class="m-0 min-h-[2.7em] text-[1.02rem] font-black leading-tight"><?= e($item['name']) ?></h3>
                    <p class="m-0 min-h-[4.7em] text-[0.94rem] leading-relaxed text-text-secondary"><?= e(excerpt(($item['short_description'] ?? '') ?: $item['description'], 84)) ?></p>
                    <strong class="text-[1.5rem] font-black text-amber-glow drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><?= money((float) $item['price']) ?></strong>
                </div>
                <a class="btn-secondary mt-auto min-h-[44px]" href="<?= url('product.php?slug=' . urlencode($item['slug'])) ?>">Ver produto</a>
            </article>
        <?php endforeach; ?>
    </div>
<?php endif; ?>
<script>
(() => {
    const mainImage = document.getElementById('productMainImage');
    const galleryList = document.querySelector('[data-gallery-list]');
    let thumbs = document.querySelectorAll('[data-gallery-src]');
    const zoomFrame = document.querySelector('[data-product-zoom]');
    const zoomLens = zoomFrame?.querySelector('.product-zoom-lens');
    const zoomPanel = document.querySelector('[data-zoom-panel]');
    const productSide = document.querySelector('[data-product-side]');
    const imageModal = document.querySelector('[data-image-modal]');
    const imageModalImg = document.querySelector('[data-image-modal-img]');
    const imageModalClose = document.querySelector('[data-image-modal-close]');
    const videoImage = document.querySelector('[data-product-video-image]');
    const referenceImage = document.querySelector('[data-product-reference-image]');
    const quantity = document.getElementById('productQuantity');
    const maxQuantity = quantity ? Number(quantity.max || 99) : 99;
    let lastTap = 0;

    const setMainImage = (src) => {
        if (!mainImage || !src) return;
        mainImage.src = src;
        if (imageModalImg) imageModalImg.src = src;
        if (zoomPanel) zoomPanel.style.backgroundImage = `url("${src}")`;
    };

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    })[char]);

    const refreshGalleryImages = (items) => {
        if (!galleryList || !Array.isArray(items) || !items.length) return;
        galleryList.innerHTML = items.map((item, index) => `
            <button class="product-thumb ${index === 0 ? 'is-active' : ''} group overflow-hidden rounded-[12px] border border-white/10 bg-white/5 p-1 text-left transition-all hover:-translate-y-1 hover:border-amber-accent" type="button" data-gallery-src="${escapeHtml(item.src)}">
                <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.label || 'Foto do produto')}" class="product-thumb-image aspect-square w-full rounded-[8px] bg-background">
                <span class="mt-1 block truncate px-1 text-[0.68rem] font-black uppercase tracking-[0.08em] text-text-secondary">${escapeHtml(item.label || `Foto ${index + 1}`)}</span>
            </button>
        `).join('');
        thumbs = galleryList.querySelectorAll('[data-gallery-src]');
        setMainImage(items[0].src);
        if (videoImage) videoImage.src = items[0].src;
        if (referenceImage) referenceImage.src = (items[Math.min(3, items.length - 1)] || items[0]).src;
    };

    galleryList?.addEventListener('click', (event) => {
        const thumb = event.target.closest('[data-gallery-src]');
        if (!thumb) return;
        thumbs.forEach((item) => item.classList.remove('is-active'));
        thumb.classList.add('is-active');
        setMainImage(thumb.dataset.gallerySrc);
    });

    document.querySelectorAll('.product-color').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.product-color').forEach((item) => item.classList.remove('is-selected'));
            button.classList.add('is-selected');
            const items = JSON.parse(button.dataset.variantGallery || '[]');
            if (items.length) {
                refreshGalleryImages(items);
                return;
            }
            setMainImage(button.dataset.variantImage);
        });
    });

    document.querySelectorAll('.product-size:not(:disabled)').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.product-size').forEach((item) => item.classList.remove('is-selected'));
            button.classList.add('is-selected');
        });
    });

    const isDesktopPointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (zoomFrame && mainImage && zoomPanel && zoomLens) {
        zoomPanel.style.backgroundImage = `url("${mainImage.src}")`;
        const updateZoom = (event) => {
            const rect = zoomFrame.getBoundingClientRect();
            const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
            const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;

            zoomLens.style.left = `${x}px`;
            zoomLens.style.top = `${y}px`;
            zoomPanel.style.backgroundSize = '220%';
            zoomPanel.style.backgroundPosition = `${percentX}% ${percentY}%`;
        };

        zoomFrame.addEventListener('mouseenter', (event) => {
            if (!isDesktopPointer()) return;
            zoomFrame.classList.add('is-zooming');
            zoomPanel.classList.add('is-visible');
            productSide?.classList.add('is-zooming');
            zoomPanel.setAttribute('aria-hidden', 'false');
            updateZoom(event);
        });
        zoomFrame.addEventListener('mousemove', (event) => {
            if (!isDesktopPointer()) return;
            updateZoom(event);
        });
        zoomFrame.addEventListener('mouseleave', () => {
            zoomFrame.classList.remove('is-zooming');
            zoomPanel.classList.remove('is-visible');
            productSide?.classList.remove('is-zooming');
            zoomPanel.setAttribute('aria-hidden', 'true');
        });
        zoomFrame.addEventListener('click', () => {
            if (!isDesktopPointer() || !imageModal || !imageModalImg) return;
            imageModalImg.src = mainImage.src;
            imageModal.classList.add('is-open');
            imageModal.setAttribute('aria-hidden', 'false');
        });
        zoomFrame.addEventListener('touchend', () => {
            const now = Date.now();
            if (now - lastTap < 300) {
                zoomFrame.classList.toggle('is-mobile-zoomed');
                if (zoomFrame.classList.contains('is-mobile-zoomed')) {
                    mainImage.style.transformOrigin = 'center';
                }
            }
            lastTap = now;
        });
    }

    imageModalClose?.addEventListener('click', () => {
        imageModal?.classList.remove('is-open');
        imageModal?.setAttribute('aria-hidden', 'true');
    });
    imageModal?.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            imageModal.classList.remove('is-open');
            imageModal.setAttribute('aria-hidden', 'true');
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            imageModal?.classList.remove('is-open');
            imageModal?.setAttribute('aria-hidden', 'true');
        }
    });

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
