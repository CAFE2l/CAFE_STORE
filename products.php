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

<section class="relative -mt-[72px] min-h-[560px] overflow-hidden border-b border-white/5 bg-background noise md:min-h-[620px]">
    <div class="absolute inset-0">
        <img src="<?= url('assets/images/banners/Produtos.png') ?>" alt="Produtos CAFÉ STORE" class="h-full w-full object-cover opacity-75">
        <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,8,6,.92),rgba(10,8,6,.52),rgba(10,8,6,.86))]"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_72%_36%,rgba(200,135,58,.22),transparent_28rem)]"></div>
    </div>
    <div class="relative z-10 mx-auto grid min-h-[560px] max-w-[1280px] items-center px-4 pb-16 pt-28 md:min-h-[620px] md:px-6 lg:px-8">
        <div class="max-w-[760px] animate-fade-up">
            <span class="badge-amber">Apoio ao projeto</span>
            <h1 class="mt-6 font-display text-[clamp(3.4rem,8vw,7rem)] font-black leading-[0.92] tracking-tight text-text-primary">Produtos <span class="gradient-text">CAFÉ</span></h1>
            <p class="mt-6 max-w-[44rem] text-lg font-semibold leading-relaxed text-text-secondary">Camisetas, acessórios, chaveiros, canecas e moletons para quem quer apoiar a CAFÉ STORE e fortalecer a marca.</p>
            <div class="mt-8 flex flex-wrap gap-3">
                <a href="#produtos" class="btn-primary">Ver produtos</a>
                <a href="<?= url('services.php') ?>" class="btn-secondary">Conhecer serviços</a>
            </div>
        </div>
    </div>
</section>

<main class="relative z-10 mx-auto max-w-[1280px] px-4 py-10 md:px-6 md:py-12 lg:px-8">
    <section id="produtos" class="glass-light mb-6 rounded-2xl p-5">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">aviso importante</p>
        <h2 class="m-0 font-display text-2xl font-black text-text-primary">Produtos desta aba são apoio/doação</h2>
        <p class="mt-3 max-w-[56rem] leading-relaxed text-text-secondary">Os itens desta página existem para apoiar o projeto e fortalecer a marca CAFÉ. Quando houver produção oficial com entrega física, isso será informado com prazo, disponibilidade e condições separadas.</p>
    </section>

    <form class="glass mb-8 grid items-center gap-3 rounded-2xl p-4 max-md:grid-cols-1 md:grid-cols-[1fr_240px_auto]" method="get">
        <input name="q" value="<?= e($search) ?>" placeholder="Buscar camisetas, acessórios, chaveiros..." class="input-field">
        <select name="category_id" class="input-field">
            <option value="0" class="text-black">Todas as categorias</option>
            <?php foreach ($categories as $cat): ?>
                <option value="<?= (int) $cat['id'] ?>" <?= $category === (int) $cat['id'] ? 'selected' : '' ?> class="text-black"><?= e($cat['name']) ?></option>
            <?php endforeach; ?>
        </select>
        <button class="btn-primary" type="submit">Filtrar</button>
    </form>

    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <?php foreach ($products as $product): ?>
            <article class="card-product flex min-h-full flex-col p-3.5">
                <a href="<?= url('product.php?slug=' . urlencode($product['slug'])) ?>" class="block overflow-hidden rounded-xl bg-background">
                    <img src="<?= e(product_main_image($product)) ?>" alt="<?= e($product['name']) ?>" class="aspect-[4/3] w-full object-cover">
                </a>
                <div class="grid flex-1 gap-2.5 pt-4">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span class="badge-muted"><?= e($product['category_name'] ?? 'CAFÉ') ?></span>
                        <span class="badge-amber"><?= e(product_type_label($product['type'])) ?></span>
                    </div>
                    <h3 class="m-0 min-h-[2.7em] font-display text-[1.08rem] font-black leading-tight text-text-primary"><?= e($product['name']) ?></h3>
                    <p class="m-0 min-h-[4.7em] text-[0.94rem] leading-relaxed text-text-secondary"><?= e(excerpt($product['short_description'] ?: $product['description'], 100)) ?></p>
                    <strong class="font-mono text-[1.45rem] font-black text-amber-glow text-glow"><?= money((float) $product['price']) ?></strong>
                </div>
                <div class="mt-4 grid grid-cols-2 gap-2">
                    <a class="btn-secondary min-h-[44px] px-4 py-2" href="<?= url('product.php?slug=' . urlencode($product['slug'])) ?>">Detalhes</a>
                    <form action="<?= url('api/cart-add.php') ?>" method="post">
                        <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
                        <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                        <button class="btn-primary min-h-[44px] w-full px-4 py-2" type="submit">Apoiar</button>
                    </form>
                    <form class="col-span-2" action="<?= url('api/wishlist-toggle.php') ?>" method="post">
                        <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                        <input type="hidden" name="redirect_to" value="products.php">
                        <button class="btn-ghost min-h-[40px] w-full" type="submit"><?= in_array((int) $product['id'], $favoriteProductIds, true) ? 'Remover dos desejos' : 'Adicionar aos desejos' ?></button>
                    </form>
                </div>
            </article>
        <?php endforeach; ?>
        <?php if (!$products): ?><p class="glass col-span-full rounded-2xl p-5 text-text-secondary">Nenhum produto encontrado.</p><?php endif; ?>
    </div>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
