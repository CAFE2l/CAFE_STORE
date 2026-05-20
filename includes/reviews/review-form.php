<?php if (current_user()): ?>
    <form class="glass grid gap-3 rounded-2xl p-4" action="<?= url('api/reviews/create-review.php') ?>" method="post" enctype="multipart/form-data">
        <div>
            <strong class="text-lg text-white"><?= $myReview ? 'Atualizar avaliação' : 'Escrever avaliação' ?></strong>
            <p class="mt-1 text-sm text-text-secondary">Disponível para clientes logados. Avaliações ficam pendentes até a moderação.</p>
        </div>
        <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
        <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-secondary">Nota
            <select class="input-field" name="rating" required>
                <?php for ($i = 5; $i >= 1; $i--): ?>
                    <option value="<?= $i ?>" <?= (int) ($myReview['rating'] ?? 5) === $i ? 'selected' : '' ?> class="text-black"><?= $i ?> estrelas</option>
                <?php endfor; ?>
            </select>
        </label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-secondary">Comentário
            <textarea class="input-field min-h-[132px] resize-y" name="comment" rows="4" maxlength="2000" required><?= e($myReview['comment'] ?? '') ?></textarea>
        </label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-secondary">Fotos da avaliação
            <input class="input-field file:mr-3 file:rounded-[10px] file:border-0 file:bg-amber-accent file:px-3 file:py-1.5 file:font-black file:text-background file:cursor-pointer" type="file" name="review_images[]" accept="image/jpeg,image/png,image/webp" multiple>
        </label>
        <button class="btn-primary w-fit" type="submit"><?= $myReview ? 'Atualizar avaliação' : 'Enviar avaliação' ?></button>
        <?php if ($myReview): ?>
            <button class="btn-secondary w-fit" formaction="<?= url('api/reviews/delete-review.php') ?>" formmethod="post">Excluir minha avaliação</button>
        <?php endif; ?>
    </form>
<?php else: ?>
    <p class="text-text-secondary">Faça login para avaliar este produto.</p>
<?php endif; ?>
