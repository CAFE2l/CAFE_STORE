<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();

$orderId = (int) ($_GET['id'] ?? 0);
if ($orderId <= 0) {
    redirect('admin/orders.php');
}

$stmt = db()->prepare("
    SELECT o.*, u.name AS user_name, u.email AS user_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = ?
    LIMIT 1
");
$stmt->execute([$orderId]);
$order = $stmt->fetch();

if (!$order) {
    http_response_code(404);
    exit('Pedido não encontrado.');
}

$itemsStmt = db()->prepare("
    SELECT oi.*, p.image_url, p.main_image_url, p.slug
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
    ORDER BY oi.id
");
$itemsStmt->execute([$orderId]);
$items = $itemsStmt->fetchAll();

$address = json_decode((string) ($order['shipping_address'] ?? ''), true);
if (!is_array($address)) {
    $address = [];
}

$statusLabels = [
    'pending' => 'Pendente',
    'processing' => 'Processando',
    'shipped' => 'Enviado',
    'completed' => 'Entregue',
    'cancelled' => 'Cancelado',
];

include __DIR__ . '/../includes/header.php';
?>
<div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[240px_1fr]">
    <?php include __DIR__ . '/../includes/sidebar-admin.php'; ?>
    <section class="grid min-w-0 gap-5">
        <div class="flex items-end justify-between gap-6">
            <div>
                <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">pedido</p>
                <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Pedido #<?= (int) $order['id'] ?></h1>
            </div>
            <a class="btn-ghost min-h-[44px]" href="<?= url('admin/orders.php') ?>">Voltar</a>
        </div>

        <div class="grid items-start gap-5 lg:grid-cols-[1fr_360px]">
            <section class="glass rounded-2xl p-6">
                <h2 class="m-0 mb-4 text-2xl font-black text-text-primary">Itens do pedido</h2>
                <div class="grid gap-3">
                    <?php foreach ($items as $item): ?>
                        <article class="grid items-center gap-4 rounded-[10px] border border-white/10 bg-background/60 p-3 md:grid-cols-[74px_1fr_auto]">
                            <img src="<?= e(product_image($item['main_image_url'] ?: $item['image_url'])) ?>" alt="<?= e($item['product_name']) ?>" class="h-[64px] w-[74px] rounded-[10px] object-cover">
                            <div>
                                <strong class="block text-text-primary"><?= e($item['product_name']) ?></strong>
                                <span class="mt-1 block text-sm text-text-muted">Quantidade: <?= (int) $item['quantity'] ?> · Unitário: <?= money((float) ($item['unit_price'] ?: $item['price'])) ?></span>
                            </div>
                            <strong class="text-amber-glow"><?= money((float) ($item['total_price'] ?: ((float) $item['price'] * (int) $item['quantity']))) ?></strong>
                        </article>
                    <?php endforeach; ?>
                </div>
            </section>

            <aside class="grid gap-4 glass rounded-2xl p-6">
                <section>
                    <h2 class="m-0 mb-3 text-xl font-black text-text-primary">Status</h2>
                    <form class="grid gap-3" data-order-status-form>
                        <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
                        <input type="hidden" name="order_id" value="<?= (int) $order['id'] ?>">
                        <select name="status" class="input-field min-h-[44px]">
                            <?php foreach ($statusLabels as $value => $label): ?>
                                <option value="<?= e($value) ?>" <?= $order['status'] === $value ? 'selected' : '' ?> class="text-black"><?= e($label) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <button class="btn-primary min-h-[44px]" type="submit">Atualizar status</button>
                        <p class="m-0 text-sm font-bold text-text-muted" data-order-status-message></p>
                    </form>
                </section>

                <section class="border-t border-white/10 pt-4">
                    <h2 class="m-0 mb-3 text-xl font-black text-text-primary">Cliente</h2>
                    <p class="leading-relaxed text-text-secondary">
                        <?= e($order['customer_name'] ?: ($order['user_name'] ?? '')) ?><br>
                        <?= e($order['customer_email'] ?: ($order['user_email'] ?? '')) ?><br>
                        <?= e($order['customer_phone'] ?? '') ?>
                    </p>
                </section>

                <section class="border-t border-white/10 pt-4">
                    <h2 class="m-0 mb-3 text-xl font-black text-text-primary">Entrega</h2>
                    <p class="leading-relaxed text-text-secondary">
                        <?= e(($address['street'] ?? '') . ', ' . ($address['number'] ?? '')) ?><br>
                        <?php if (!empty($address['complement'])): ?><?= e($address['complement']) ?><br><?php endif; ?>
                        <?= e(($address['district'] ?? '') . ' - ' . ($address['city'] ?? '') . '/' . ($address['state'] ?? '')) ?><br>
                        CEP <?= e($address['postal_code'] ?? '') ?>
                    </p>
                </section>

                <section class="border-t border-white/10 pt-4">
                    <span class="text-sm font-black uppercase tracking-[0.12em] text-text-muted">Total</span>
                    <strong class="mt-1 block text-2xl text-amber-glow"><?= money((float) ($order['total_amount'] ?: $order['total'])) ?></strong>
                </section>
            </aside>
        </div>
    </section>
</div>
<script>
document.querySelector('[data-order-status-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector('[data-order-status-message]');
    const response = await fetch('<?= url('api/admin/update-order-status.php') ?>', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    const data = await response.json().catch(() => ({}));
    message.textContent = data.message || (response.ok ? 'Status atualizado.' : 'Não foi possível atualizar.');
    message.classList.toggle('text-amber-glow', response.ok);
    message.classList.toggle('text-state-error', !response.ok);
});
</script>
<?php include __DIR__ . '/../includes/footer.php'; ?>
