<?php
require_once __DIR__ . '/config/helpers.php';

$categories = db()->query("
    SELECT c.*, COUNT(p.id) AS product_count
    FROM categories c
    JOIN products p ON p.category_id = c.id AND p.status = 'active'
    GROUP BY c.id
    ORDER BY c.name
")->fetchAll();
$search = trim($_GET['q'] ?? '');
$category = (int) ($_GET['category_id'] ?? 0);

$where = ["p.status = 'active'"];
$params = [];
if ($search !== '') {
    $where[] = '(p.name LIKE ? OR p.description LIKE ?)';
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if ($category > 0) {
    $where[] = 'p.category_id = ?';
    $params[] = $category;
}

$sql = 'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE ' . implode(' AND ', $where) . ' ORDER BY p.created_at DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();
$favoriteProductIds = [];
if (current_user()) {
    $favoriteRows = db()->prepare('SELECT product_id FROM favorites WHERE user_id = ?');
    $favoriteRows->execute([(int) $_SESSION['user_id']]);
    $favoriteProductIds = array_map('intval', $favoriteRows->fetchAll(PDO::FETCH_COLUMN));
}

include __DIR__ . '/includes/header.php';
?>
</main>

<style>
/* smooth animations, glass and shadow effects */
@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
}
.hero-banner {
    /* ficar no topo da página, atrás do header sticky, mais para cima */
    position: relative;
    width: 100%;
    /* reduzir a altura final para remover 100-150px na parte inferior */
    height: calc(90vh - 130px);
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    will-change: opacity, transform;
    /* empurrar ainda mais para cima */
    margin-top: calc(-140px);
    z-index: 10; /* abaixo do header (z-40) */
    opacity: 1; /* iniciar 100% opaco */
    /* arredondar laterais e parte de baixo */
    border-radius: 0 0 8px 8px;
    transition: opacity .9s cubic-bezier(.22,.61,.36,1), transform .7s cubic-bezier(.22,.61,.36,1);
    box-shadow: 0 12px 30px rgba(0,0,0,0.42) inset, 0 24px 48px rgba(0,0,0,0.35);
}
.hero-banner.overflow-hidden { overflow: hidden; }
.hero-banner .hero-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    filter: saturate(1.05) contrast(1.03);
    will-change: filter, transform;
    transition: filter .6s ease, transform .6s ease;
}
.hero-banner .hero-overlay {
    position: absolute;
    inset: 0;
    /* overlay levemente quente para combinar com o design, porém mais claro */
    background: linear-gradient(180deg, rgba(255,140,0,0.02) 0%, rgba(10,10,10,0.08) 100%);
    pointer-events: none;
    transition: background .5s ease;
}
.hero-banner .hero-content {
    position: relative;
    z-index: 20; /* acima da imagem, abaixo do header */
    text-align: center;
    padding: 2rem;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    color: #fff;
    /* texto mais brilhante e legível */
    text-shadow: 0 18px 46px rgba(0,0,0,0.6), 0 6px 20px rgba(255,160,0,0.12);
    transition: transform .6s cubic-bezier(.22,.61,.36,1), opacity .6s ease;
}
.hero-banner .hero-text-panel {
    display: inline-block;
    background: linear-gradient(135deg, rgba(8,8,8,0.24), rgba(8,8,8,0.12));
    border: 1px solid rgba(255,255,255,0.16);
    backdrop-filter: blur(2px) saturate(1.06);
    -webkit-backdrop-filter: blur(2px) saturate(1.06);
    padding: clamp(18px, 3vw, 30px);
    border-radius: 12px;
    box-shadow: 0 18px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08);
    max-width: min(92%, 760px);
    animation: fadeInUp .72s cubic-bezier(.22,.61,.36,1) both;
    transition: background .35s ease, transform .35s ease, box-shadow .35s ease, border-color .35s ease;
}
.hero-banner .hero-text-panel:hover {
    transform: translateY(-3px);
    border-color: rgba(255,215,0,0.26);
    box-shadow: 0 22px 52px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.12);
}
.hero-banner .hero-text-panel p,
.hero-banner .hero-text-panel h1,
.hero-banner .hero-text-panel .mb-2.5 {
    color: #ffffff !important;
    opacity: 1 !important;
}
.hero-banner .hero-content h1 {
    font-size: clamp(2.4rem,5.2vw,4.8rem);
    font-weight: 950;
    letter-spacing: 0;
    -webkit-text-stroke: 0.5px rgba(0,0,0,0.5);
    filter: drop-shadow(0 14px 34px rgba(0,0,0,0.62));
    line-height: 0.98;
}
.hero-banner .hero-content .bg-clip-text {
    -webkit-text-stroke: 0.4px rgba(0,0,0,0.38);
}
.hero-banner .hero-brand-word {
    color: #ffb000 !important;
    background: none !important;
    -webkit-text-fill-color: #ffb000;
    -webkit-text-stroke: 1px rgba(0,0,0,0.72);
    text-shadow:
        0 2px 0 rgba(255,60,56,0.88),
        0 10px 24px rgba(0,0,0,0.72),
        0 0 18px rgba(255,176,0,0.42);
    filter: none;
}
.hero-banner .hero-kicker {
    color: #ffd700 !important;
    text-shadow: 0 2px 12px rgba(0,0,0,0.72);
}
.hero-banner .hero-copy {
    color: rgba(255,255,255,0.9) !important;
    font-size: clamp(1rem, 1.5vw, 1.2rem);
    font-weight: 650;
    line-height: 1.6;
    text-shadow: 0 3px 16px rgba(0,0,0,0.82);
}
.hero-banner .hero-content a {
    z-index: 21;
    box-shadow: 0 14px 38px rgba(0,0,0,0.45), 0 8px 22px rgba(255,140,0,0.14);
    transition: transform .28s ease, box-shadow .28s ease;
}
.hero-banner .hero-content a:hover { transform: translateY(-3px); }
@media (max-width: 640px) {
    .hero-banner {
        height: 70vh;
        min-height: 360px;
        margin-top: calc(-72px);
        border-radius: 0 0 6px 6px;
    }
    .hero-banner .hero-content { padding: 1.25rem; }
    .hero-banner .hero-text-panel { padding: 16px; max-width: 95%; }
}

/* garantir que main comece após o banner na página (não flutue sobre a imagem) */
main.relative.z-10.mx-auto.max-w-[1280px].px-4.py-8.md\:px-6.md\:py-10.lg\:px-8 {
    margin-top: 0; /* conteúdo seguirá normalmente abaixo do banner */
}
</style>

<div class="hero-banner" id="heroBanner">
    <div class="hero-bg" style="background-image: url('<?= url('assets/images/banners/Produtos.png') ?>');"></div>
    <div class="hero-overlay"></div>
    <div class="hero-content">
        <div class="hero-text-panel">
            <p class="hero-kicker mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em]">apoio ao projeto</p>
            <h1 class="m-0 text-[clamp(2.5rem,6vw,5rem)] font-black leading-tight tracking-tight text-white">Produtos <span class="hero-brand-word">CAFÉ</span></h1>
            <p class="hero-copy mt-4 mx-auto max-w-[42rem]">Camisetas, acessórios, chaveiros, canecas e moletons para quem quer apoiar a CAFÉ STORE.</p>
            <div style="margin-top:14px; display:flex; justify-content:center;">
                <a href="#produtos" class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)]">Ver Produtos</a>
            </div>
        </div>
    </div>
</div>

<main class="relative z-10 mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-10 lg:px-8">

<section id="produtos" class="mb-6 rounded-2xl border border-glow-400/40 bg-glow-400/10 p-5 text-midnight-100 backdrop-blur-lg">
    <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">aviso importante</p>
    <h2 class="m-0 text-xl font-black text-glow-400">Produtos desta aba são apoio/doação</h2>
    <p class="mt-3 max-w-[56rem] leading-relaxed text-midnight-300">Os itens desta página existem para apoiar o projeto e fortalecer a marca CAFÉ. Quando houver produção oficial com entrega física, isso será informado com prazo, disponibilidade e condições separadas.</p>
</section>

<form class="mb-6 grid items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg max-md:grid-cols-1 md:grid-cols-[1fr_240px_auto]" method="get">
    <input name="q" value="<?= e($search) ?>" placeholder="Buscar camisetas, acessórios, chaveiros..." class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.12),0_0_15px_rgba(255,215,0,0.1)]">
    <select name="category_id" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.12),0_0_15px_rgba(255,215,0,0.1)]">
        <option value="0" class="text-black">Todas as categorias</option>
        <?php foreach ($categories as $cat): ?>
            <option value="<?= (int) $cat['id'] ?>" <?= $category === (int) $cat['id'] ? 'selected' : '' ?> class="text-black"><?= e($cat['name']) ?></option>
        <?php endforeach; ?>
    </select>
    <button class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)]" type="submit">Filtrar</button>
</form>

<div class="grid gap-5 md:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-1">
    <?php foreach ($products as $product): ?>
        <article class="flex min-h-full flex-col gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2),0_0_30px_rgba(255,107,0,0.15)] hover:border-ember-500/30">
            <a href="<?= url('product.php?slug=' . urlencode($product['slug'])) ?>">
                <div class="overflow-hidden rounded-[10px]">
                    <img src="<?= e(product_main_image($product)) ?>" alt="<?= e($product['name']) ?>" class="aspect-[4/3] w-full bg-midnight-900 object-cover transition-transform duration-500 hover:scale-110">
                </div>
            </a>
            <div class="grid gap-2.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400"><?= e($product['category_name'] ?? 'CAFÉ') ?></span>
                    <span class="inline-flex w-fit items-center justify-center rounded-full border border-ember-500/40 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-ember-300"><?= e(product_type_label($product['type'])) ?></span>
                </div>
                <h3 class="m-0 min-h-[2.7em] text-[1.02rem] font-black leading-tight"><?= e($product['name']) ?></h3>
                <p class="m-0 min-h-[4.7em] text-[0.94rem] leading-relaxed text-midnight-400"><?= e(excerpt($product['short_description'] ?: $product['description'], 100)) ?></p>
                <strong class="text-[1.5rem] font-black text-glow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><?= money((float) $product['price']) ?></strong>
            </div>
            <div class="mt-auto grid grid-cols-2 gap-2">
                <a class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-glow-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]" href="<?= url('product.php?slug=' . urlencode($product['slug'])) ?>">Detalhes</a>
                <form action="<?= url('api/cart-add.php') ?>" method="post">
                    <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                    <button class="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)]" type="submit">Apoiar</button>
                </form>
                <form class="col-span-2" action="<?= url('api/wishlist-toggle.php') ?>" method="post">
                    <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                    <input type="hidden" name="redirect_to" value="products.php">
                    <button class="inline-flex w-full min-h-[40px] items-center justify-center rounded-[10px] border border-white/20 bg-white/5 px-3 text-sm font-black text-white transition-all duration-300 hover:border-glow-400" type="submit"><?= in_array((int) $product['id'], $favoriteProductIds, true) ? 'Remover dos desejos' : 'Adicionar aos desejos' ?></button>
                </form>
            </div>
        </article>
    <?php endforeach; ?>
    <?php if (!$products): ?><p class="col-span-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg text-midnight-400">Nenhum produto encontrado.</p><?php endif; ?>
</div>
<script>
(function() {
    var hero = document.getElementById('heroBanner');
    if (!hero) return;
    var heroBg = hero.querySelector('.hero-bg');
    function updateOpacity() {
        var scrollY = window.scrollY || 0;
        var heroHeight = hero.offsetHeight || 1;
        // progress 0..1 as we scroll through the hero height
        var progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);
        // banner fades from 1 -> 0 as user scrolls through hero
        hero.style.opacity = String(1 - progress);
        // subtle parallax and transform for depth
        heroBg.style.transform = 'translateY(' + Math.round(progress * 20) + 'px) scale(' + (1 - progress*0.02) + ')';
        // increase blur slightly as it fades
        heroBg.style.filter = 'saturate(1.05) contrast(1.03) blur(' + (progress * 4).toFixed(2) + 'px)';
    }
    window.addEventListener('scroll', updateOpacity, { passive: true });
    // also update on resize
    window.addEventListener('resize', updateOpacity, { passive: true });
    updateOpacity();
})();
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>
