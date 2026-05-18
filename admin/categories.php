<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        flash('error', 'Sessão expirada.');
        redirect('admin/categories.php');
    }

    $id = (int) ($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $slug = slugify($_POST['slug'] ?: $name);
    $action = $_POST['action'] ?? 'save';

    if ($action === 'delete' && $id > 0) {
        db()->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
        flash('success', 'Categoria excluida.');
        redirect('admin/categories.php');
    }

    if ($name === '') {
        flash('error', 'Informe o nome da categoria.');
    } elseif ($id > 0) {
        db()->prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?')->execute([$name, $slug, $id]);
        flash('success', 'Categoria atualizada.');
    } else {
        db()->prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')->execute([$name, $slug]);
        flash('success', 'Categoria criada.');
    }

    redirect('admin/categories.php');
}

$categories = db()->query('SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id ORDER BY c.name')->fetchAll();
include __DIR__ . '/../includes/header.php';
?>
<div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[240px_1fr]">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="grid gap-5 min-w-0">
        <div class="flex items-end justify-between gap-6">
            <div>
                <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">catálogo</p>
                <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Categorias</h1>
            </div>
        </div>
        <form class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg grid gap-4" method="post">
            <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
            <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Nome <input class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" name="name" required></label>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">Slug <input class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" name="slug" placeholder="gerado automaticamente se vazio"></label>
            <button class="inline-flex w-fit min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)]" type="submit">Criar categoria</button>
        </form>
        <div class="grid gap-3">
            <?php foreach ($categories as $category): ?>
                <form class="grid items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-lg max-md:grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto]" method="post">
                    <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
                    <input type="hidden" name="id" value="<?= (int) $category['id'] ?>">
                    <input class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" name="name" value="<?= e($category['name']) ?>">
                    <input class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" name="slug" value="<?= e($category['slug']) ?>">
                    <span class="inline-flex min-w-[24px] items-center justify-center rounded-full border border-glow-400 bg-glow-400 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-midnight-950"><?= (int) $category['product_count'] ?> produtos</span>
                    <button class="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-3 text-[0.86rem] font-black leading-none text-midnight-950 transition-all duration-300 hover:bg-[100%_0] hover:scale-105" name="action" value="save" type="submit">Salvar</button>
                    <button class="border-0 bg-transparent cursor-pointer font-black text-fire-300 transition-all duration-300 hover:text-fire-500 hover:drop-shadow-[0_0_10px_rgba(255,60,56,0.5)]" name="action" value="delete" type="submit">Excluir</button>
                </form>
            <?php endforeach; ?>
            <?php if (!$categories): ?><p class="text-midnight-400">Nenhuma categoria cadastrada.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
