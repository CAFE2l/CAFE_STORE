<?php
if (!file_exists(__DIR__ . "/config/helpers.php")) {
    die("Arquivo config/helpers.php não encontrado!");
}
require_once __DIR__ . "/config/helpers.php";

try {
    $pdo = db();
    $stmt = $pdo->prepare(
        "SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC LIMIT 6",
    );
    $stmt->execute();
    $featured = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmtCat = $pdo->prepare("
        SELECT c.*, COUNT(p.id) AS product_count
        FROM categories c
        JOIN products p ON p.category_id = c.id AND p.status = 'active'
        GROUP BY c.id
        ORDER BY c.name
        LIMIT 6
    ");
    $stmtCat->execute();
    $categories = $stmtCat->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Erro no index.php: " . $e->getMessage());
    $featured = [];
    $categories = [];
}

if (file_exists(__DIR__ . "/includes/header.php")) {
    include __DIR__ . "/includes/header.php";
} else {
    echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>CAFÉ STORE</title></head><body>";
}
?>

<section class="relative grid min-h-[calc(100vh-140px)] items-center gap-10 overflow-hidden py-10 lg:grid-cols-[1fr_0.82fr] lg:py-16">
    <div class="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_80%_32%,rgba(200,135,58,.22),transparent_26rem)]"></div>
    <div class="animate-fade-up">
        <span class="badge-amber">Loja premium da marca</span>
        <h1 class="mt-6 font-display text-[clamp(3.4rem,8vw,7rem)] font-black leading-[0.92] tracking-tight text-text-primary">
            CAFÉ <span class="gradient-text text-glow">STORE</span>
        </h1>
        <p class="mt-6 max-w-[680px] text-lg font-semibold leading-relaxed text-text-secondary">Agência digital para criar sites, landing pages, vídeos curtos, vídeos longos e web aplicações para o seu negócio.</p>
        <div class="mt-8 flex flex-wrap items-center gap-3">
            <a class="btn-primary" href="<?= url("services.php") ?>">Ver serviços</a>
            <a class="btn-secondary" href="#projeto">Conhecer projeto</a>
        </div>
    </div>
    <div class="relative justify-self-center lg:justify-self-end">
        <div class="absolute inset-8 -z-10 rounded-full bg-amber-accent/20 blur-3xl"></div>
        <?php
        $mascotPath = __DIR__ . "/assets/images/mascote.png";
        if (file_exists($mascotPath)): ?>
            <img src="<?= url("assets/images/mascote.png") ?>" alt="Mascote CAFÉ STORE" class="animate-float w-[min(88vw,520px)] object-contain drop-shadow-[0_30px_80px_rgba(200,135,58,.28)]">
        <?php else: ?>
            <div class="text-center text-6xl">🔥</div>
        <?php endif; ?>
    </div>
</section>

<section id="projeto" class="mb-16 grid gap-5 md:grid-cols-3">
    <?php foreach ([
        ['01', 'Agência digital', 'Serviços digitais ficam na página Serviços: sites, landing pages, vídeos e web aplicações.'],
        ['02', 'Produtos de apoio', 'Camisetas, acessórios, chaveiros, canecas e moletons ficam reservados para apoio à marca.'],
        ['03', 'Serviços separados', 'Sites, landing pages, vídeos e web aplicações ficam somente na página de serviços.'],
    ] as [$number, $title, $copy]): ?>
        <article class="card p-6">
            <span class="badge-amber"><?= e($number) ?></span>
            <h3 class="mt-5 font-display text-2xl font-black text-text-primary"><?= e($title) ?></h3>
            <p class="mt-3 leading-relaxed text-text-secondary"><?= e($copy) ?></p>
        </article>
    <?php endforeach; ?>
</section>

<div class="mb-6 mt-14 flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start">
    <div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">destaques</p>
        <h2 class="m-0 font-display text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight gradient-text">Produtos em alta</h2>
    </div>
    <a class="btn-ghost" href="<?= url("products.php") ?>">Ver tudo</a>
</div>

<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <?php if (!empty($featured)): ?>
        <?php foreach ($featured as $product): ?>
            <article class="card-product flex min-h-full flex-col p-3.5">
                <a href="<?= url("product.php?slug=" . urlencode($product["slug"] ?? "")) ?>" class="block overflow-hidden rounded-xl bg-background">
                    <?php
                    $imgSrc = product_main_image($product);
                    $altText = e($product["name"] ?? "Produto");
                    ?>
                    <img src="<?= e($imgSrc) ?>" alt="<?= $altText ?>" onerror="this.src='<?= url("assets/images/mascote.png") ?>'" class="aspect-[4/3] w-full object-cover">
                </a>
                <div class="grid flex-1 gap-2.5 pt-4">
                    <span class="badge-muted w-fit"><?= e(product_type_label($product["type"] ?? "digital")) ?></span>
                    <h3 class="m-0 min-h-[2.7em] font-display text-[1.08rem] font-black leading-tight text-text-primary"><?= e($product["name"] ?? "Sem nome") ?></h3>
                    <p class="m-0 min-h-[4.7em] text-[0.94rem] leading-relaxed text-text-secondary"><?= e(excerpt($product["short_description"] ?? "" ?: $product["description"] ?? "", 90)) ?></p>
                    <strong class="font-mono text-[1.45rem] font-black text-amber-glow text-glow"><?= money((float) ($product["price"] ?? 0)) ?></strong>
                </div>
                <form action="<?= url("api/cart-add.php") ?>" method="post" class="mt-4">
                    <input type="hidden" name="product_id" value="<?= (int) ($product["id"] ?? 0) ?>">
                    <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
                    <button class="btn-primary w-full" type="submit">Adicionar ao carrinho</button>
                </form>
            </article>
        <?php endforeach; ?>
    <?php else: ?>
        <p class="glass col-span-full rounded-2xl p-5 text-text-secondary">
            Nenhum produto ativo ainda. <br>
            <small><a class="font-bold text-amber-glow" href="<?= url("admin/products.php") ?>">Acesse o painel</a> para cadastrar itens.</small>
        </p>
    <?php endif; ?>
</div>

<div class="mb-6 mt-16">
    <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">categorias</p>
    <h2 class="m-0 font-display text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight text-text-primary">Escolha seu produto de apoio</h2>
</div>

<div class="mb-16 grid gap-5 md:grid-cols-3">
    <?php if (!empty($categories)): ?>
        <?php foreach ($categories as $cat): ?>
            <a class="card block p-6" href="<?= url("products.php?category_id=" . (int) ($cat["id"] ?? 0)) ?>">
                <span class="badge-amber"><?= (int) ($cat["product_count"] ?? 0) ?> produtos</span>
                <h3 class="mt-5 font-display text-2xl font-black text-text-primary"><?= e($cat["name"] ?? "Sem nome") ?></h3>
                <p class="mt-3 leading-relaxed text-text-secondary">Explore produtos de apoio desta categoria.</p>
            </a>
        <?php endforeach; ?>
    <?php else: ?>
        <article class="card p-6">
            <span class="badge-amber">CAFÉ</span>
            <h3 class="mt-5 font-display text-2xl font-black text-text-primary">Produtos de apoio</h3>
            <p class="mt-3 leading-relaxed text-text-secondary">Cadastre categorias no painel para organizar a vitrine de apoio.</p>
        </article>
    <?php endif; ?>
</div>

<section class="glass-light noise relative overflow-hidden rounded-2xl px-6 py-12 text-center led-amber">
    <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">pronto para elevar sua presença?</p>
    <h2 class="font-display text-[clamp(2rem,4vw,3.6rem)] font-black gradient-text">Apoie a CAFÉ STORE</h2>
    <p class="mx-auto mt-4 max-w-[42rem] leading-relaxed text-text-secondary">Produtos simbólicos para fortalecer a marca enquanto os serviços ficam organizados na página própria.</p>
    <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a class="btn-primary animate-pulse-glow" href="<?= url("products.php") ?>">Ver catálogo</a>
        <a class="btn-secondary" href="<?= url("register.php") ?>">Criar conta</a>
    </div>
</section>

<?php if (file_exists(__DIR__ . "/includes/footer.php")) {
    include __DIR__ . "/includes/footer.php";
} else {
    echo "</body></html>";
}
?>
