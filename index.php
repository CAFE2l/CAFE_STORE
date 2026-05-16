<?php
require_once __DIR__ . '/config/helpers.php';
$stmt = db()->query("SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC LIMIT 6");
$featured = $stmt->fetchAll();
$categories = db()->query('SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.status = "active" GROUP BY c.id ORDER BY c.name LIMIT 6')->fetchAll();
include __DIR__ . '/includes/header.php';
?>
<section class="hero">
    <div class="hero-copy">
        <p class="eyebrow">loja oficial da marca</p>
        <h1>CAFÉ <span class="gradient-text">STORE</span></h1>
        <p>Produtos digitais, overlays, templates e assets organizados para criadores que precisam de uma identidade online consistente, clara e profissional.</p>
        <div class="hero-actions mt-8">
            <a class="btn primary" href="<?= url('products.php') ?>">Explorar produtos</a>
            <a class="btn ghost" href="#projeto">Conhecer projeto</a>
        </div>
    </div>
    <div class="hero-mascot glass-card">
        <img src="<?= url('assets/images/mascot.svg') ?>" alt="Chama amarela com óculos pretos">
    </div>
</section>

<section id="projeto" class="benefit-grid">
    <article class="benefit-card">
        <span class="pill">01</span>
        <h2 class="mt-4 text-xl font-black">Assets prontos para usar</h2>
        <p class="muted">Overlays, packs e templates pensados para criadores que precisam montar uma presença visual com agilidade.</p>
    </article>
    <article class="benefit-card">
        <span class="pill">02</span>
        <h2 class="mt-4 text-xl font-black">Catálogo organizado</h2>
        <p class="muted">Produtos separados por categorias, com leitura clara, cards proporcionais e navegação simples.</p>
    </article>
    <article class="benefit-card">
        <span class="pill">03</span>
        <h2 class="mt-4 text-xl font-black">Fluxo simples</h2>
        <p class="muted">Escolha o produto, adicione ao carrinho e finalize com Pix, cartão ou Mercado Pago.</p>
    </article>
</section>

<section class="section-head">
    <div>
        <p class="eyebrow">destaques</p>
        <h2>Produtos em alta</h2>
    </div>
    <a class="btn ghost" href="<?= url('products.php') ?>">Ver tudo</a>
</section>

<div class="product-grid">
    <?php foreach ($featured as $product): ?>
        <article class="product-card">
            <a href="<?= url('product.php?slug=' . urlencode($product['slug'])) ?>">
                <img src="<?= e(product_image($product['image_url'])) ?>" alt="<?= e($product['name']) ?>">
            </a>
            <div>
                <span class="pill"><?= e($product['type']) ?></span>
                <h3><?= e($product['name']) ?></h3>
                <p><?= e(excerpt($product['description'], 90)) ?></p>
                <strong class="product-price text-2xl"><?= money((float) $product['price']) ?></strong>
            </div>
            <form action="<?= url('api/cart-add.php') ?>" method="post">
                <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
                <button class="btn primary full" type="submit">Adicionar ao carrinho</button>
            </form>
        </article>
    <?php endforeach; ?>
    <?php if (!$featured): ?>
        <p class="empty glass-card p-5">Cadastre produtos no painel admin para preencher a vitrine.</p>
    <?php endif; ?>
</div>

<section class="section-head">
    <div>
        <p class="eyebrow">categorias</p>
        <h2>Escolha seu tipo de asset</h2>
    </div>
</section>
<div class="benefit-grid">
    <?php foreach ($categories as $cat): ?>
        <a class="benefit-card" href="<?= url('products.php?category_id=' . (int) $cat['id']) ?>">
            <span class="pill"><?= (int) $cat['product_count'] ?> produtos</span>
            <h3 class="mt-4 text-xl font-black"><?= e($cat['name']) ?></h3>
            <p class="muted">Explore itens digitais desta coleção.</p>
        </a>
    <?php endforeach; ?>
    <?php if (!$categories): ?>
        <article class="benefit-card">
            <span class="pill">CAFÉ</span>
            <h3 class="mt-4 text-xl font-black">Coleções digitais</h3>
            <p class="muted">Cadastre categorias no painel para organizar a vitrine.</p>
        </article>
    <?php endif; ?>
</div>

<section class="glass-card section-padding mt-8 text-center">
    <p class="eyebrow">pronto para elevar sua presença?</p>
    <h2 class="text-2xl font-black gradient-text">Monte seu kit digital CAFÉ STORE</h2>
    <p class="muted max-w-2xl mt-4" style="margin-inline:auto;">Templates, overlays e packs organizados em uma experiência simples, rápida e responsiva.</p>
    <div class="hero-actions mt-6" style="justify-content:center;">
        <a class="btn primary" href="<?= url('products.php') ?>">Ver catálogo</a>
        <a class="btn ghost" href="<?= url('register.php') ?>">Criar conta</a>
    </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
