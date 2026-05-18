<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();
$users = db()->query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')->fetchAll();
include __DIR__ . '/../includes/header.php';
?>
<div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[240px_1fr]">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="grid gap-5 min-w-0">
        <div class="flex items-end justify-between gap-6">
            <div>
                <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">comunidade</p>
                <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Usuarios</h1>
            </div>
        </div>
        <div class="grid gap-3">
            <?php foreach ($users as $user): ?>
                <div class="grid items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-lg max-md:grid-cols-1 md:grid-cols-[1fr_1.2fr_100px_minmax(150px,auto)]">
                    <span class="font-bold"><?= e($user['name']) ?><small class="mt-1 block text-midnight-400 font-semibold">#<?= (int) $user['id'] ?></small></span>
                    <span class="text-midnight-400"><?= e($user['email']) ?></span>
                    <strong class="inline-flex w-fit items-center justify-center rounded-full border <?= $user['role'] === 'admin' ? 'border-ember-500/40 text-ember-300' : 'border-white/20 text-glow-400' ?> px-[9px] py-[4px] text-[0.76rem] font-bold leading-none"><?= e($user['role']) ?></strong>
                    <span class="text-midnight-400"><?= e($user['created_at']) ?></span>
                </div>
            <?php endforeach; ?>
            <?php if (!$users): ?><p class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg text-midnight-400">Nenhum usuario encontrado.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
