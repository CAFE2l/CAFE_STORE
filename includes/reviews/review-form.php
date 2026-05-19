<?php if (current_user()): ?>
    <form class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg grid gap-3" action="<?= url('api/reviews/create-review.php') ?>" method="post" enctype="multipart/form-data">
        <div>
            <strong class="text-lg text-white"><?= $myReview ? 'Atualizar avaliação' : 'Escrever avaliação' ?></strong>
            <p class="mt-1 text-sm text-midnight-400">Disponível para clientes logados. Avaliações ficam pendentes até a moderação.</p>
        </div>
        <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
        <input type="hidden" name="product_id" value="<?= (int) $product['id'] ?>">
        <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Nota
            <select class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" name="rating" required>
                <?php for ($i = 5; $i >= 1; $i--): ?>
                    <option value="<?= $i ?>" <?= (int) ($myReview['rating'] ?? 5) === $i ? 'selected' : '' ?> class="text-black"><?= $i ?> estrelas</option>
                <?php endfor; ?>
            </select>
        </label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Comentário
            <textarea class="w-full min-h-[132px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400 resize-y" name="comment" rows="4" maxlength="2000" required><?= e($myReview['comment'] ?? '') ?></textarea>
        </label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Fotos da avaliação
            <input class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400 file:mr-3 file:rounded-[10px] file:border-0 file:bg-glow-400 file:px-3 file:py-1.5 file:font-black file:text-midnight-950 file:cursor-pointer" type="file" name="review_images[]" accept="image/jpeg,image/png,image/webp" multiple>
        </label>
        <button class="inline-flex w-fit min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)]" type="submit"><?= $myReview ? 'Atualizar avaliação' : 'Enviar avaliação' ?></button>
        <?php if ($myReview): ?>
            <button class="inline-flex w-fit min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-glow-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]" formaction="<?= url('api/reviews/delete-review.php') ?>" formmethod="post">Excluir minha avaliação</button>
        <?php endif; ?>
    </form>
<?php else: ?>
    <p class="text-midnight-400">Faça login para avaliar este produto.</p>
<?php endif; ?>
