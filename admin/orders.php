<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();

$status = trim((string) ($_GET['status'] ?? ''));
$date = trim((string) ($_GET['date'] ?? ''));
$search = trim((string) ($_GET['q'] ?? ''));
$allowedStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
$statusLabels = [
    'pending' => 'Pendente',
    'processing' => 'Processando',
    'shipped' => 'Enviado',
    'completed' => 'Entregue',
    'cancelled' => 'Cancelado',
];

$where = [];
$params = [];
if ($status !== '' && in_array($status, $allowedStatuses, true)) {
    $where[] = 'o.status = ?';
    $params[] = $status;
}
if ($date !== '') {
    $where[] = 'DATE(o.created_at) = ?';
    $params[] = $date;
}
if ($search !== '') {
    $where[] = '(u.name LIKE ? OR u.email LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)';
    $term = '%' . $search . '%';
    array_push($params, $term, $term, $term, $term);
}

$sql = "
    SELECT o.*, u.name AS user_name, u.email AS user_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
";
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY o.created_at DESC';

$stmt = db()->prepare($sql);
$stmt->execute($params);
$orders = $stmt->fetchAll();

include __DIR__ . '/../includes/header.php';
?>
<div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[240px_1fr]">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="grid gap-5 min-w-0">
        <div class="flex items-end justify-between gap-6">
            <div>
                <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">operações</p>
                <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Pedidos</h1>
            </div>
        </div>

        <form class="grid gap-3 glass rounded-2xl p-4 md:grid-cols-[180px_180px_1fr_auto]" method="get">
            <label class="grid gap-1.5 text-sm font-black text-text-muted">
                <span>Status</span>
                <select name="status" class="input-field min-h-[44px]">
                    <option value="" class="text-black">Todos</option>
                    <?php foreach ($statusLabels as $value => $label): ?>
                        <option value="<?= e($value) ?>" <?= $status === $value ? 'selected' : '' ?> class="text-black"><?= e($label) ?></option>
                    <?php endforeach; ?>
                </select>
            </label>
            <label class="grid gap-1.5 text-sm font-black text-text-muted">
                <span>Data</span>
                <input type="date" name="date" value="<?= e($date) ?>" class="input-field min-h-[44px]">
            </label>
            <label class="grid gap-1.5 text-sm font-black text-text-muted">
                <span>Cliente</span>
                <input name="q" value="<?= e($search) ?>" placeholder="Nome ou e-mail" class="input-field min-h-[44px]">
            </label>
            <button class="btn-primary self-end min-h-[44px]" type="submit">Filtrar</button>
        </form>

        <div class="grid gap-3">
            <?php foreach ($orders as $order): ?>
                <div class="grid items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-lg max-md:grid-cols-1 md:grid-cols-[1.4fr_120px_120px_150px_auto]">
                    <span class="font-bold text-text-primary">#<?= (int) $order['id'] ?> - <?= e($order['customer_name'] ?: ($order['user_name'] ?? 'Cliente')) ?><small class="mt-1 block text-text-muted font-semibold"><?= e($order['customer_email'] ?: ($order['user_email'] ?? '')) ?> · <?= e(date('d/m/Y H:i', strtotime((string) $order['created_at']))) ?></small></span>
                    <strong class="text-amber-glow text-glow"><?= money((float) ($order['total_amount'] ?: $order['total'])) ?></strong>
                    <span class="badge border-amber-secondary/40 text-amber-secondary"><?= e($statusLabels[$order['status']] ?? $order['status']) ?></span>
                    <span class="badge <?= $order['payment_status'] === 'paid' ? 'text-amber-glow border-amber-accent/40' : 'border-state-error/40 text-state-error' ?>"><?= e($order['payment_status']) ?> / <?= e($order['payment_method']) ?></span>
                    <a class="btn-ghost min-h-[40px] px-4" href="<?= url('admin/order-detail.php?id=' . (int) $order['id']) ?>">Detalhe</a>
                </div>
            <?php endforeach; ?>
            <?php if (!$orders): ?><p class="glass rounded-2xl p-5 text-text-muted">Nenhum pedido encontrado.</p><?php endif; ?>
        </div>
    </section>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
