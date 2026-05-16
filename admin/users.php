<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();
$users = db()->query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')->fetchAll();
include __DIR__ . '/../includes/header.php';
?>
<div class="admin-layout">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="admin-content">
        <div class="section-head compact">
            <div>
                <p class="eyebrow">comunidade</p>
                <h1>Usuários</h1>
            </div>
        </div>
        <div class="table admin-table">
            <?php foreach ($users as $user): ?>
                <div class="table-row users-row">
                    <span class="font-bold"><?= e($user['name']) ?><small>#<?= (int) $user['id'] ?></small></span>
                    <span class="muted"><?= e($user['email']) ?></span>
                    <strong class="status-badge <?= $user['role'] === 'admin' ? 'orange' : '' ?>"><?= e($user['role']) ?></strong>
                    <span class="muted"><?= e($user['created_at']) ?></span>
                </div>
            <?php endforeach; ?>
            <?php if (!$users): ?><p class="empty glass-card p-5">Nenhum usuário encontrado.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
