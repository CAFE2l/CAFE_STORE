<?php $editing = isset($product); ?>
<form class="grid gap-4 max-w-[920px] rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg" method="post">
    <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
    <div class="grid gap-4 md:grid-cols-2">
        <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Categoria
            <select name="category_id" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400">
                <option value="" class="text-black">Sem categoria</option>
                <?php foreach ($categories as $cat): ?>
                    <option value="<?= (int) $cat['id'] ?>" <?= $editing && (int) $product['category_id'] === (int) $cat['id'] ? 'selected' : '' ?> class="text-black"><?= e($cat['name']) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Tipo
            <select name="type" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400">
                <?php foreach (['site', 'landing_page', 'video_curto', 'video_longo', 'web_app'] as $type): ?>
                    <option value="<?= $type ?>" <?= ($product['type'] ?? 'digital') === $type ? 'selected' : '' ?> class="text-black"><?= $type ?></option>
                <?php endforeach; ?>
            </select>
        </label>
    </div>
    <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Nome <input name="name" value="<?= e($product['name'] ?? '') ?>" required class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400"></label>
    <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Slug <input name="slug" value="<?= e($product['slug'] ?? '') ?>" placeholder="gerado pelo nome se vazio" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400"></label>
    <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Descrição curta <input name="short_description" value="<?= e($product['short_description'] ?? '') ?>" maxlength="255" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400"></label>
    <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Descrição <textarea name="description" rows="6" class="w-full min-h-[132px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400 resize-y"><?= e($product['description'] ?? '') ?></textarea></label>
    <div class="grid gap-4 md:grid-cols-3">
        <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Preco <input type="number" step="0.01" name="price" value="<?= e((string) ($product['price'] ?? '')) ?>" required class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400"></label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Preco antigo <input type="number" step="0.01" name="old_price" value="<?= e((string) ($product['old_price'] ?? '')) ?>" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400"></label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Estoque <input type="number" name="stock" value="<?= e((string) ($product['stock'] ?? 0)) ?>" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400"></label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Status
            <select name="status" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400">
                <option value="active" <?= ($product['status'] ?? 'active') === 'active' ? 'selected' : '' ?> class="text-black">active</option>
                <option value="draft" <?= ($product['status'] ?? '') === 'draft' ? 'selected' : '' ?> class="text-black">draft</option>
            </select>
        </label>
    </div>
    <label class="inline-flex items-center gap-2 font-black text-midnight-400"><input type="checkbox" name="is_digital" value="1" <?= (int) ($product['is_digital'] ?? 1) === 1 ? 'checked' : '' ?> class="accent-ember-500"> Produto digital</label>
    <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Imagem principal <input name="main_image_url" value="<?= e($product['main_image_url'] ?? $product['image_url'] ?? '') ?>" placeholder="https://res.cloudinary.com/..." class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400"></label>
    <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Imagens adicionais <textarea name="gallery_images" rows="3" placeholder="Uma URL por linha" class="w-full min-h-[132px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400"><?= e($galleryImagesText ?? '') ?></textarea></label>
    <button class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)]" type="submit">Salvar produto</button>
</form>
