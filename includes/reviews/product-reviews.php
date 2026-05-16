<section class="section product-reviews">
    <div class="section-head compact">
        <div>
            <p class="eyebrow">avaliações</p>
            <h2>Feedback de clientes</h2>
        </div>
        <div class="star-rating" aria-label="<?= e((string) $reviewAverage) ?> de 5">
            <strong><?= number_format((float) $reviewAverage, 1, ',', '.') ?></strong>
            <span><?= str_repeat('★', (int) round($reviewAverage)) ?><?= str_repeat('☆', 5 - (int) round($reviewAverage)) ?></span>
            <small class="muted"><?= (int) $reviewCount ?> avaliações</small>
        </div>
    </div>

    <?php include __DIR__ . '/review-form.php'; ?>

    <div class="review-list">
        <?php foreach ($reviews as $review): ?>
            <article class="card review-card">
                <header>
                    <strong><?= e($review['user_name']) ?></strong>
                    <span class="star-rating"><?= str_repeat('★', (int) $review['rating']) ?><?= str_repeat('☆', 5 - (int) $review['rating']) ?></span>
                </header>
                <p><?= nl2br(e($review['comment'])) ?></p>
                <?php if (!empty($review['images'])): ?>
                    <div class="review-images">
                        <?php foreach ($review['images'] as $image): ?>
                            <img src="<?= e(product_image($image['image_url'])) ?>" alt="Foto enviada na avaliação">
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </article>
        <?php endforeach; ?>
        <?php if (!$reviews): ?>
            <p class="empty">Este produto ainda não possui avaliações.</p>
        <?php endif; ?>
    </div>
</section>
