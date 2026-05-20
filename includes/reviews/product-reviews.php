<section class="mt-14" id="avaliacoes">
    <div class="flex items-center justify-between gap-6 mb-6 flex-wrap">
        <div>
            <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">avaliações</p>
            <h2 class="product-section-title m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight gradient-text">Feedback de clientes</h2>
        </div>
        <div class="glass rounded-2xl p-4">
            <div class="flex items-center gap-2">
                <strong class="font-mono text-2xl text-amber-glow"><?= number_format((float) $reviewAverage, 1, ',', '.') ?></strong>
                <span class="text-amber-glow"><?= str_repeat('★', (int) round($reviewAverage)) ?><?= str_repeat('☆', 5 - (int) round($reviewAverage)) ?></span>
                <small class="text-text-secondary"><?= (int) $reviewCount ?> avaliações</small>
            </div>
        </div>
    </div>

    <div class="product-premium-panel mb-6 grid gap-4 rounded-2xl p-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
            <strong class="font-mono block text-[3rem] leading-none text-amber-glow text-glow"><?= number_format((float) $reviewAverage, 1, ',', '.') ?></strong>
            <span class="mt-2 block text-amber-glow"><?= str_repeat('★', (int) round($reviewAverage)) ?><?= str_repeat('☆', 5 - (int) round($reviewAverage)) ?></span>
            <p class="mt-2 text-sm font-bold text-text-secondary">Nota geral baseada nas avaliações aprovadas.</p>
        </div>
        <div class="grid gap-2">
            <?php for ($star = 5; $star >= 1; $star--): ?>
                <?php $count = (int) ($reviewDistribution[$star] ?? 0); $percent = $reviewCount > 0 ? min(100, ($count / $reviewCount) * 100) : 0; ?>
                <div class="grid grid-cols-[42px_1fr_34px] items-center gap-3 text-sm">
                    <span class="font-black text-white"><?= $star ?>★</span>
                    <span class="h-2 overflow-hidden rounded-full bg-white/10">
                        <span class="block h-full rounded-full bg-gradient-to-r from-amber-secondary to-amber-glow" style="width: <?= $percent ?>%"></span>
                    </span>
                    <span class="text-right font-bold text-text-secondary"><?= $count ?></span>
                </div>
            <?php endfor; ?>
        </div>
    </div>

    <div class="mb-5 flex flex-wrap gap-2">
        <button class="rounded-full border border-amber-accent bg-amber-accent/10 px-4 py-2 text-sm font-black text-amber-glow" type="button">Todas</button>
        <button class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-black text-white" type="button">Com foto</button>
        <button class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-black text-white" type="button">5 estrelas</button>
        <input class="input-field min-h-[40px] rounded-full px-4 py-2 text-sm" type="search" placeholder="Buscar palavra-chave">
    </div>

    <?php include __DIR__ . '/review-form.php'; ?>

    <div class="grid gap-4 mt-6">
        <?php foreach ($reviews as $review): ?>
            <article class="card p-4">
                <header class="flex items-center gap-3 flex-wrap justify-between">
                    <div class="flex items-center gap-3 flex-wrap">
                    <strong><?= e($review['user_name']) ?></strong>
                    <span class="text-amber-glow"><?= str_repeat('★', (int) $review['rating']) ?><?= str_repeat('☆', 5 - (int) $review['rating']) ?></span>
                    <?php if (!empty($review['verified_purchase'])): ?>
                        <span class="rounded-full border border-amber-accent/35 bg-amber-accent/10 px-2.5 py-1 text-xs font-black text-amber-glow">Compra verificada</span>
                    <?php endif; ?>
                    </div>
                    <time class="text-xs font-bold text-text-muted"><?= e(date('d/m/Y', strtotime($review['created_at'] ?? 'now'))) ?></time>
                </header>
                <p class="mt-2 text-text-secondary"><?= nl2br(e($review['comment'])) ?></p>
                <?php if (!empty($review['images'])): ?>
                    <div class="flex gap-2 mt-3">
                        <?php foreach ($review['images'] as $image): ?>
                            <img src="<?= e(product_image($image['image_url'])) ?>" alt="Foto enviada na avaliação" class="w-20 h-20 rounded-[10px] object-cover bg-background-surface">
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </article>
        <?php endforeach; ?>
        <?php if (!$reviews): ?>
            <p class="text-text-secondary">Este produto ainda não possui avaliações.</p>
        <?php endif; ?>
    </div>
</section>
