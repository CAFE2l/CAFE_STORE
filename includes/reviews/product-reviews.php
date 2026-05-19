<section class="mt-14" id="avaliacoes">
    <div class="flex items-center justify-between gap-6 mb-6 flex-wrap">
        <div>
            <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">avaliações</p>
            <h2 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight text-ember-400">Feedback de clientes</h2>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
            <div class="flex items-center gap-2">
                <strong class="text-2xl text-glow-400"><?= number_format((float) $reviewAverage, 1, ',', '.') ?></strong>
                <span class="text-glow-400"><?= str_repeat('★', (int) round($reviewAverage)) ?><?= str_repeat('☆', 5 - (int) round($reviewAverage)) ?></span>
                <small class="text-midnight-400"><?= (int) $reviewCount ?> avaliações</small>
            </div>
        </div>
    </div>

    <div class="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-lg lg:grid-cols-[0.8fr_1.2fr]">
        <div>
            <strong class="block text-[3rem] leading-none text-glow-400"><?= number_format((float) $reviewAverage, 1, ',', '.') ?></strong>
            <span class="mt-2 block text-glow-400"><?= str_repeat('★', (int) round($reviewAverage)) ?><?= str_repeat('☆', 5 - (int) round($reviewAverage)) ?></span>
            <p class="mt-2 text-sm font-bold text-midnight-400">Nota geral baseada nas avaliações aprovadas.</p>
        </div>
        <div class="grid gap-2">
            <?php for ($star = 5; $star >= 1; $star--): ?>
                <?php $count = (int) ($reviewDistribution[$star] ?? 0); $percent = $reviewCount > 0 ? min(100, ($count / $reviewCount) * 100) : 0; ?>
                <div class="grid grid-cols-[42px_1fr_34px] items-center gap-3 text-sm">
                    <span class="font-black text-white"><?= $star ?>★</span>
                    <span class="h-2 overflow-hidden rounded-full bg-white/10">
                        <span class="block h-full rounded-full bg-gradient-to-r from-ember-500 to-glow-400" style="width: <?= $percent ?>%"></span>
                    </span>
                    <span class="text-right font-bold text-midnight-400"><?= $count ?></span>
                </div>
            <?php endfor; ?>
        </div>
    </div>

    <div class="mb-5 flex flex-wrap gap-2">
        <button class="rounded-full border border-glow-400 bg-glow-400/10 px-4 py-2 text-sm font-black text-glow-400" type="button">Todas</button>
        <button class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-black text-white" type="button">Com foto</button>
        <button class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-black text-white" type="button">5 estrelas</button>
        <input class="min-h-[40px] rounded-full border border-white/10 bg-midnight-950/80 px-4 text-sm text-white outline-none focus:border-glow-400" type="search" placeholder="Buscar palavra-chave">
    </div>

    <?php include __DIR__ . '/review-form.php'; ?>

    <div class="grid gap-4 mt-6">
        <?php foreach ($reviews as $review): ?>
            <article class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
                <header class="flex items-center gap-3 flex-wrap justify-between">
                    <div class="flex items-center gap-3 flex-wrap">
                    <strong><?= e($review['user_name']) ?></strong>
                    <span class="text-glow-400"><?= str_repeat('★', (int) $review['rating']) ?><?= str_repeat('☆', 5 - (int) $review['rating']) ?></span>
                    <span class="rounded-full border border-glow-400/35 bg-glow-400/10 px-2.5 py-1 text-xs font-black text-glow-400">Compra verificada</span>
                    </div>
                    <time class="text-xs font-bold text-midnight-500"><?= e(date('d/m/Y', strtotime($review['created_at'] ?? 'now'))) ?></time>
                </header>
                <p class="mt-2 text-midnight-400"><?= nl2br(e($review['comment'])) ?></p>
                <?php if (!empty($review['images'])): ?>
                    <div class="flex gap-2 mt-3">
                        <?php foreach ($review['images'] as $image): ?>
                            <img src="<?= e(product_image($image['image_url'])) ?>" alt="Foto enviada na avaliação" class="w-20 h-20 rounded-[10px] object-cover bg-midnight-900">
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </article>
        <?php endforeach; ?>
        <?php if (!$reviews): ?>
            <p class="text-midnight-400">Este produto ainda não possui avaliações.</p>
        <?php endif; ?>
    </div>
</section>
