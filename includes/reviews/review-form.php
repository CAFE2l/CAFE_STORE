<?php if (current_user()): ?>
    <form class="form-card review-form" action="<?= url('api/reviews/create-review.php') ?>" method="post" enctype="multipart/form-data">
        <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
        <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
        <label>Nota
            <select class="input-field" name="rating" required>
                <?php for ($i = 5; $i >= 1; $i--): ?>
                    <option value="<?= $i ?>" <?= (int) ($myReview['rating'] ?? 5) === $i ? 'selected' : '' ?>><?= $i ?> estrelas</option>
                <?php endfor; ?>
            </select>
        </label>
        <label>Comentário
            <textarea class="input-field" name="comment" rows="4" maxlength="2000" required><?= e($myReview['comment'] ?? '') ?></textarea>
        </label>
        <label>Fotos da avaliação
            <input class="input-field" type="file" name="review_images[]" accept="image/jpeg,image/png,image/webp" multiple>
        </label>
        <button class="btn btn-primary primary" type="submit"><?= $myReview ? 'Atualizar avaliação' : 'Enviar avaliação' ?></button>
        <?php if ($myReview): ?>
            <button class="btn btn-secondary ghost" formaction="<?= url('api/reviews/delete-review.php') ?>" formmethod="post">Excluir minha avaliação</button>
        <?php endif; ?>
    </form>
<?php else: ?>
    <p class="muted">Faça login para avaliar este produto.</p>
<?php endif; ?>
