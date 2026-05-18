<section class="mt-14">
    <div class="flex items-center justify-between gap-6 mb-6 flex-wrap">
        <div>
            <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">avaliações</p>
            <h2 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight text-ember-400">Feedback de clientes</h2>
        </div>
        <div class="flex items-center gap-2">
            <strong class="text-glow-400"><?= number_format((float) $reviewAverage, 1, ',', '.') ?></strong>
            <span class="text-glow-400"><?= str_repeat('★', (int) round($reviewAverage)) ?><?= str_repeat('☆', 5 - (int) round($reviewAverage)) ?></span>
            <small class="text-midnight-400"><?= (int) $reviewCount ?> avaliações</small>
        </div>
    </div>

    <?php include __DIR__ . '/review-form.php'; ?>

    <div class="grid gap-4 mt-6">
        <?php foreach ($reviews as $review): ?>
            <article class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
                <header class="flex items-center gap-3 flex-wrap">
                    <strong><?= e($review['user_name']) ?></strong>
                    <span class="text-glow-400"><?= str_repeat('★', (int) $review['rating']) ?><?= str_repeat('☆', 5 - (int) $review['rating']) ?></span>
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
