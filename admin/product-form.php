<?php
$editing = isset($product);
$currentMainImage = trim((string) ($product['main_image_url'] ?? $product['image_url'] ?? ''));
$currentGalleryImages = array_filter(array_map('trim', preg_split('/\R/', $galleryImagesText ?? '')));
$currentImages = product_normalize_image_set($currentMainImage, $currentGalleryImages);
$currentImageCount = ($currentImages['main'] ? 1 : 0) + count($currentImages['gallery']);
?>
<form class="grid gap-4 max-w-[920px] glass p-6" method="post" enctype="multipart/form-data">
    <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
    <div class="grid gap-4 md:grid-cols-2">
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Categoria
            <select name="category_id" class="input-field">
                <option value="" class="text-black">Sem categoria</option>
                <?php foreach ($categories as $cat): ?>
                    <option value="<?= (int) $cat['id'] ?>" <?= $editing && (int) $product['category_id'] === (int) $cat['id'] ? 'selected' : '' ?> class="text-black"><?= e($cat['name']) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Tipo
            <select name="type" class="input-field">
                <?php foreach (['site', 'landing_page', 'video_curto', 'video_longo', 'web_app'] as $type): ?>
                    <option value="<?= $type ?>" <?= ($product['type'] ?? 'digital') === $type ? 'selected' : '' ?> class="text-black"><?= $type ?></option>
                <?php endforeach; ?>
            </select>
        </label>
    </div>
    <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Nome <input name="name" value="<?= e($product['name'] ?? '') ?>" required class="input-field"></label>
    <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Slug <input name="slug" value="<?= e($product['slug'] ?? '') ?>" placeholder="gerado pelo nome se vazio" class="input-field"></label>
    <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Descrição curta <input name="short_description" value="<?= e($product['short_description'] ?? '') ?>" maxlength="255" class="input-field"></label>
    <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Descrição <textarea name="description" rows="6" class="input-field resize-y"><?= e($product['description'] ?? '') ?></textarea></label>
    <div class="grid gap-4 md:grid-cols-3">
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Preco <input type="number" step="0.01" name="price" value="<?= e((string) ($product['price'] ?? '')) ?>" required class="input-field"></label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Preco antigo <input type="number" step="0.01" name="old_price" value="<?= e((string) ($product['old_price'] ?? '')) ?>" class="input-field"></label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Estoque <input type="number" name="stock" value="<?= e((string) ($product['stock'] ?? 0)) ?>" class="input-field"></label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Status
            <select name="status" class="input-field">
                <option value="active" <?= ($product['status'] ?? 'active') === 'active' ? 'selected' : '' ?> class="text-black">active</option>
                <option value="draft" <?= ($product['status'] ?? '') === 'draft' ? 'selected' : '' ?> class="text-black">draft</option>
            </select>
        </label>
    </div>
    <label class="inline-flex items-center gap-2 font-black text-text-muted"><input type="checkbox" name="is_digital" value="1" <?= (int) ($product['is_digital'] ?? 1) === 1 ? 'checked' : '' ?> class="accent-amber-accent"> Produto digital</label>
    <div class="grid gap-3 rounded-[12px] border border-white/10 bg-background/40 p-4">
        <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
                <strong class="block text-text-primary">Fotos do produto</strong>
                <p class="mt-1 text-sm font-semibold text-text-muted">Use no máximo 4 fotos no total. A primeira é a foto principal exibida no produto.</p>
            </div>
            <span class="rounded-full border border-amber-accent/40 bg-amber-accent/10 px-3 py-1 text-xs font-black text-amber-glow"><?= $currentImageCount ?>/4 fotos</span>
        </div>
        <?php if ($currentImages['main'] || $currentImages['gallery']): ?>
            <div class="grid gap-3 sm:grid-cols-4">
                <?php foreach (array_merge([$currentImages['main']], $currentImages['gallery']) as $index => $imageUrl): ?>
                    <?php if (!$imageUrl) { continue; } ?>
                    <div class="overflow-hidden rounded-[10px] border border-white/10 bg-background/60 p-2">
                        <img src="<?= e(product_image($imageUrl)) ?>" alt="Foto <?= $index + 1 ?>" class="aspect-square w-full rounded-[8px] object-cover">
                        <span class="mt-2 block text-xs font-black uppercase tracking-[0.08em] text-text-muted"><?= $index === 0 ? 'Principal' : 'Foto ' . ($index + 1) ?></span>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Foto principal por URL
            <input name="main_image_url" value="<?= e($currentMainImage) ?>" placeholder="https://res.cloudinary.com/... ou assets/uploads/products/..." class="input-field">
        </label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Fotos adicionais por URL
            <textarea name="gallery_images" rows="3" placeholder="Uma URL por linha. O sistema salva somente até completar 4 fotos." class="input-field"><?= e(implode("\n", $currentImages['gallery'])) ?></textarea>
        </label>
        <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">Enviar novas fotos
            <input type="file" name="product_images[]" multiple accept="image/png,image/jpeg,image/webp" class="w-full rounded-[10px] border border-white/10 bg-background/60 p-2.5 text-text-primary outline-none file:mr-4 file:rounded-[8px] file:border-0 file:bg-amber-accent file:px-3 file:py-2 file:font-black file:text-background">
        </label>
    </div>
    <button class="btn-primary" type="submit">Salvar produto</button>
</form>
