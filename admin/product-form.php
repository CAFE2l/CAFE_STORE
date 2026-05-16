<?php $editing = isset($product); ?>
<form class="admin-form panel" method="post">
    <div class="grid gap-4 md:grid-cols-2">
        <label>Categoria
            <select name="category_id">
                <option value="">Sem categoria</option>
                <?php foreach ($categories as $cat): ?>
                    <option value="<?= (int) $cat['id'] ?>" <?= $editing && (int) $product['category_id'] === (int) $cat['id'] ? 'selected' : '' ?>><?= e($cat['name']) ?></option>
                <?php endforeach; ?>
            </select>
        </label>
        <label>Tipo
            <select name="type">
                <?php foreach (['digital', 'overlay', 'template', 'wallpaper', 'pack', 'preset'] as $type): ?>
                    <option value="<?= $type ?>" <?= ($product['type'] ?? 'digital') === $type ? 'selected' : '' ?>><?= $type ?></option>
                <?php endforeach; ?>
            </select>
        </label>
    </div>
    <label>Nome <input name="name" value="<?= e($product['name'] ?? '') ?>" required></label>
    <label>Slug <input name="slug" value="<?= e($product['slug'] ?? '') ?>" placeholder="gerado pelo nome se vazio"></label>
    <label>Descrição <textarea name="description" rows="6"><?= e($product['description'] ?? '') ?></textarea></label>
    <div class="grid gap-4 md:grid-cols-3">
        <label>Preço <input type="number" step="0.01" name="price" value="<?= e((string) ($product['price'] ?? '')) ?>" required></label>
        <label>Estoque <input type="number" name="stock" value="<?= e((string) ($product['stock'] ?? 0)) ?>"></label>
        <label>Status
            <select name="status">
                <option value="active" <?= ($product['status'] ?? 'active') === 'active' ? 'selected' : '' ?>>active</option>
                <option value="draft" <?= ($product['status'] ?? '') === 'draft' ? 'selected' : '' ?>>draft</option>
            </select>
        </label>
    </div>
    <label>URL da imagem <input name="image_url" value="<?= e($product['image_url'] ?? '') ?>" placeholder="https://res.cloudinary.com/..."></label>
    <button class="btn primary" type="submit">Salvar produto</button>
</form>
