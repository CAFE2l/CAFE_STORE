<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();
$id = (int) ($_GET['id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        flash('error', 'Sessão expirada.');
        redirect('admin/products.php');
    }
    $stmt = db()->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);
    flash('success', 'Produto excluido.');
    redirect('admin/products.php');
}

$stmt = db()->prepare('SELECT id, name FROM products WHERE id = ?');
$stmt->execute([$id]);
$product = $stmt->fetch();
include __DIR__ . '/../includes/header.php';
?>
<div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[240px_1fr]">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Excluir produto</h1>
        <p class="mt-4 text-midnight-400">Confirma excluir <strong><?= e($product['name'] ?? 'produto') ?></strong>?</p>
        <form method="post" class="flex gap-3 mt-4">
            <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
            <button class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-fire-500 bg-fire-500 px-[18px] font-black leading-none text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,60,56,0.5)]" type="submit">Excluir</button>
            <a class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-glow-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]" href="<?= url('admin/products.php') ?>">Cancelar</a>
        </form>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
