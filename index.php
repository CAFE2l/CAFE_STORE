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

<section class="grid items-center gap-8 py-9 md:py-16 lg:grid-cols-[1fr_0.78fr] lg:gap-[5vw]">
    <div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">loja oficial da marca</p>
        <h1 class="m-0 text-[clamp(3rem,7vw,5.8rem)] font-black leading-none tracking-tight">
            CAFÉ <span class="text-glow-400">STORE</span>
        </h1>
        <p class="mt-6 max-w-[680px] text-[clamp(1rem,1.5vw,1.16rem)] leading-relaxed text-midnight-400">Agência digital para criar sites, landing pages, vídeos curtos, vídeos longos e web aplicações para o seu negócio.</p>
        <div class="mt-8 flex flex-wrap items-center gap-3">
            <a class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-glow-400 px-[18px] font-black leading-none text-midnight-950 transition-all duration-300 hover:bg-glow-300" href="<?= url(
                "services.php",
            ) ?>">Ver serviços</a>
            <a class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white transition-all duration-300 hover:border-glow-400 hover:bg-white/10" href="#projeto">Conhecer projeto</a>
        </div>
    </div>
    <div class="hero-mascote-plain justify-self-center p-0 lg:justify-self-end">
        <?php
        $mascotPath = __DIR__ . "/assets/images/mascote.png";
        if (file_exists($mascotPath)): ?>
            <img src="<?= url(
                "assets/images/mascote.png",
            ) ?>" alt="Mascote CAFÉ STORE" class="hero-mascote-plain-img mx-auto">
        <?php else: ?>
            <div class="text-center text-6xl">🔥</div>
        <?php endif;
        ?>
    </div>
</section>

<section id="projeto" class="mb-14 grid gap-5 md:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
    <article class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2),0_0_30px_rgba(255,107,0,0.15)] hover:border-ember-500/30">
        <span class="inline-flex w-fit items-center justify-center rounded-full border border-white-20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400">01</span>
        <h3 class="mt-4 text-xl font-black text-ember-400">Agência digital</h3>
        <p class="mt-3 leading-relaxed text-midnight-400">Serviços digitais ficam na página Serviços: sites, landing pages, vídeos e web aplicações.</p>
    </article>
    <article class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2),0_0_30px_rgba(255,107,0,0.15)] hover:border-ember-500/30">
        <span class="inline-flex w-fit items-center justify-center rounded-full border border-white-20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400">02</span>
        <h3 class="mt-4 text-xl font-black text-ember-400">Produtos de apoio</h3>
        <p class="mt-3 leading-relaxed text-midnight-400">Camisetas, acessórios, chaveiros, canecas e moletons ficam reservados para apoio à marca.</p>
    </article>
    <article class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2),0_0_30px_rgba(255,107,0,0.15)] hover:border-ember-500/30">
        <span class="inline-flex w-fit items-center justify-center rounded-full border border-white-20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400">03</span>
        <h3 class="mt-4 text-xl font-black text-ember-400">Serviços separados</h3>
        <p class="mt-3 leading-relaxed text-midnight-400">Sites, landing pages, vídeos e web aplicações ficam somente na página de serviços.</p>
    </article>
</section>

<div class="section-head flex items-end justify-between gap-6 mb-6 mt-14 first:mt-0">
    <div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">destaques</p>
        <h2 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight text-ember-400">Produtos em alta</h2>
    </div>
    <a class="relative inline-block font-bold text-midnight-400 transition-all duration-300 after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:rounded after:bg-gradient-to-r after:from-ember-500 after:to-glow-400 after:transition-all after:duration-300 hover:after:w-full" href="<?= url(
        "products.php",
    ) ?>">Ver tudo</a>
</div>

<div class="grid gap-5 md:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-1">
    <?php if (!empty($featured)): ?>
        <?php foreach ($featured as $product): ?>
            <article class="flex min-h-full flex-col gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2),0_0_30px_rgba(255,107,0,0.15)] hover:border-ember-500/30">
                <a href="<?= url(
                    "product.php?slug=" . urlencode($product["slug"] ?? ""),
                ) ?>">
                    <?php
                    $imgSrc = product_main_image($product);
                    $altText = e($product["name"] ?? "Produto");
                    ?>
                    <div class="overflow-hidden rounded-[10px]">
                        <img src="<?= e(
                            $imgSrc,
                        ) ?>" alt="<?= $altText ?>" onerror="this.src='<?= url(
    "assets/images/mascot.svg",
) ?>'" class="aspect-[4/3] w-full bg-midnight-900 object-cover transition-transform duration-500 hover:scale-110">
                    </div>
                </a>
                <div class="grid gap-2.5">
                    <span class="inline-flex w-fit items-center justify-center rounded-full border border-white-20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400"><?= e(
                        product_type_label($product["type"] ?? "digital"),
                    ) ?></span>
                    <h3 class="m-0 min-h-[2.7em] text-[1.02rem] font-black leading-tight"><?= e(
                        $product["name"] ?? "Sem nome",
                    ) ?></h3>
                    <p class="m-0 min-h-[4.7em] text-[0.94rem] leading-relaxed text-midnight-400"><?= e(
                        excerpt(
                            $product["short_description"] ?? "" ?:
                            $product["description"] ?? "",
                            90,
                        ),
                    ) ?></p>
                    <strong class="text-[1.5rem] font-black text-glow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><?= money(
                        (float) ($product["price"] ?? 0),
                    ) ?></strong>
                </div>
                <form action="<?= url(
                    "api/cart-add.php",
                ) ?>" method="post" class="mt-auto">
                    <input type="hidden" name="product_id" value="<?= (int) ($product[
                        "id"
                    ] ?? 0) ?>">
                    <input type="hidden" name="csrf_token" value="<?= $_SESSION[
                        "csrf_token"
                    ] ?? "" ?>">
                    <button class="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)]" type="submit">Adicionar ao carrinho</button>
                </form>
            </article>
        <?php endforeach; ?>
    <?php else: ?>
        <p class="col-span-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg text-midnight-400">
            Nenhum produto ativo ainda. <br>
            <small><a class="font-bold text-glow-400" href="<?= url(
                "admin/products.php",
            ) ?>">Acesse o painel</a> para cadastrar itens.</small>
        </p>
    <?php endif; ?>
</div>

<div class="section-head flex items-end justify-between gap-6 mb-6 mt-14 first:mt-0">
    <div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">categorias</p>
        <h2 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight text-ember-400">Escolha seu produto de apoio</h2>
    </div>
</div>

<div class="mb-14 grid gap-5 md:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
    <?php if (!empty($categories)): ?>
        <?php foreach ($categories as $cat): ?>
            <a class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2),0_0_30px_rgba(255,107,0,0.15)] hover:border-ember-500/30" href="<?= url(
                "products.php?category_id=" . (int) ($cat["id"] ?? 0),
            ) ?>">
                <span class="inline-flex w-fit items-center justify-center rounded-full border border-white-20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400"><?= (int) ($cat[
                    "product_count"
                ] ?? 0) ?> produtos</span>
                <h3 class="mt-4 text-xl font-black text-ember-400"><?= e(
                    $cat["name"] ?? "Sem nome",
                ) ?></h3>
                <p class="mt-3 leading-relaxed text-midnight-400">Explore produtos de apoio desta categoria.</p>
            </a>
        <?php endforeach; ?>
    <?php else: ?>
        <article class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
            <span class="inline-flex w-fit items-center justify-center rounded-full border border-white-20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400">CAFÉ</span>
            <h3 class="mt-4 text-xl font-black text-ember-400">Produtos de apoio</h3>
            <p class="mt-3 leading-relaxed text-midnight-400">Cadastre categorias no painel para organizar a vitrine de apoio.</p>
        </article>
    <?php endif; ?>
</div>

<section class="relative rounded-2xl border border-white/10 bg-white/5 py-10 px-6 backdrop-blur-lg text-center shadow-[0_8px_24px_rgba(0,0,0,0.15)] led-border">
    <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">pronto para elevar sua presença?</p>
    <h2 class="text-[1.5rem] font-black bg-gradient-to-r from-ember-500 to-glow-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,107,0,0.8)]">Apoie a CAFÉ STORE</h2>
    <p class="mx-auto mt-4 max-w-[42rem] leading-relaxed text-midnight-400">Produtos simbólicos para fortalecer a marca enquanto os serviços ficam organizados na página própria.</p>
    <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)] animate-pulse-glow" href="<?= url(
            "products.php",
        ) ?>">Ver catálogo</a>
        <a class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-glow-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]" href="<?= url(
            "register.php",
        ) ?>">Criar conta</a>
    </div>
</section>

<?php if (file_exists(__DIR__ . "/includes/footer.php")) {
    include __DIR__ . "/includes/footer.php";
} else {
    echo "</body></html>";
}
?>
