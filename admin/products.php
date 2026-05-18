<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();
$products = db()->query('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.created_at DESC')->fetchAll();
include __DIR__ . '/../includes/header.php';
?>
<div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[240px_1fr]">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="grid gap-5 min-w-0">
        <div class="flex items-end justify-between gap-6">
            <div>
                <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">estoque digital</p>
                <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Produtos</h1>
            </div>
            <a class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)]" href="<?= url('admin/product-create.php') ?>">Novo produto</a>
        </div>
        <div class="grid gap-3">
            <?php foreach ($products as $product): ?>
                <div class="grid items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-lg max-md:grid-cols-1 md:grid-cols-[1.4fr_120px_110px_90px_80px]">
                    <span class="min-w-[220px] font-bold"><?= e($product['name']) ?> <small class="mt-1 block text-midnight-400 font-semibold"><?= e($product['category_name'] ?? 'Sem categoria') ?></small></span>
                    <strong class="text-glow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><?= money((float) $product['price']) ?></strong>
                    <span class="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none <?= $product['status'] === 'active' ? 'text-glow-400' : 'text-ember-300 border-ember-500/40' ?>"><?= e($product['status']) ?></span>
                    <a class="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-3 text-[0.86rem] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-glow-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]" href="<?= url('admin/product-edit.php?id=' . (int) $product['id']) ?>">Editar</a>
                    <a class="border-0 bg-transparent cursor-pointer font-black text-fire-300 transition-all duration-300 hover:text-fire-500 hover:drop-shadow-[0_0_10px_rgba(255,60,56,0.5)]" href="<?= url('admin/product-delete.php?id=' . (int) $product['id']) ?>">Excluir</a>
                </div>
            <?php endforeach; ?>
            <?php if (!$products): ?><p class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg text-midnight-400">Nenhum produto cadastrado.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
