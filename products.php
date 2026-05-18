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
.hero-banner {
    position: relative;
    width: 100%;
    height: 90vh;
    min-height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    will-change: opacity;
    /* puxar o banner para o topo, sobrepondo o header sticky */
    margin-top: calc(-72px);
    z-index: 50;
}
.hero-banner .hero-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
}
.hero-banner .hero-overlay {
    position: absolute;
    inset: 0;
    /* reduzir a escuridão para deixar a imagem mais visível */
    background: linear-gradient(180deg, rgba(10,10,10,0.12) 0%, rgba(10,10,10,0.45) 100%);
}
.hero-banner .hero-content {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 2rem;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}
@media (max-width: 640px) {
    .hero-banner {
        height: 70vh;
        min-height: 400px;
    }
}
</style>

<div class="hero-banner" id="heroBanner">
    <div class="hero-bg" style="background-image: url('<?= url('assets/images/banners/Produtos.png') ?>');"></div>
    <div class="hero-overlay"></div>
    <div class="hero-content">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">apoio ao projeto</p>
        <h1 class="m-0 text-[clamp(2.5rem,6vw,5rem)] font-black leading-tight tracking-tight text-white">Produtos <span class="bg-gradient-to-r from-ember-500 to-glow-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,107,0,0.8)]">CAFÉ</span></h1>
        <p class="mt-4 mx-auto max-w-[42rem] text-lg text-midnight-300">Camisetas, acessórios, chaveiros, canecas e moletons para quem quer apoiar a CAFÉ STORE.</p>
        <a href="#produtos" class="mt-8 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)]">Ver Produtos</a>
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
    function updateOpacity() {
        if (!hero) return;
        var scrollY = window.scrollY;
        var heroHeight = hero.offsetHeight || 1;
        var distance = Math.min(heroHeight, scrollY);
        var progress = distance / heroHeight;
        // começar mais visível (0.6) e tornar totalmente opaco ao rolar
        hero.style.opacity = 0.6 + (progress * 0.4);
    }
    window.addEventListener('scroll', updateOpacity, { passive: true });
    updateOpacity();
})();
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>
