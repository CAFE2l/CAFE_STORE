<?php
require_once __DIR__ . '/config/helpers.php';
require_login();

$orderId = (int) ($_GET['id'] ?? 0);
if ($orderId <= 0) {
    redirect('orders.php');
}

$stmt = db()->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1');
$stmt->execute([$orderId, (int) $_SESSION['user_id']]);
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

include __DIR__ . '/includes/header.php';
?>
<section class="grid gap-6">
    <div class="rounded-2xl border border-amber-accent/40 bg-amber-accent/10 p-6">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">pedido realizado</p>
        <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Pedido #<?= (int) $order['id'] ?> criado com sucesso</h1>
        <p class="mt-3 max-w-3xl leading-relaxed text-text-secondary">Recebemos seu pedido de apoio. O pagamento Pix fica pendente até validação manual/operacional.</p>
    </div>

    <div class="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <section class="glass rounded-2xl p-6">
            <h2 class="m-0 mb-4 text-2xl font-black text-text-primary">Resumo dos itens</h2>
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
            <div>
                <span class="text-sm font-black uppercase tracking-[0.12em] text-text-muted">status</span>
                <strong class="mt-1 block text-xl text-amber-glow"><?= e($order['status']) ?></strong>
            </div>
            <div>
                <span class="text-sm font-black uppercase tracking-[0.12em] text-text-muted">pagamento</span>
                <strong class="mt-1 block text-text-primary"><?= e($order['payment_method']) ?> · <?= e($order['payment_status']) ?></strong>
            </div>
            <div>
                <span class="text-sm font-black uppercase tracking-[0.12em] text-text-muted">entrega</span>
                <p class="mt-1 leading-relaxed text-text-secondary">
                    <?= e(($address['street'] ?? '') . ', ' . ($address['number'] ?? '')) ?><br>
                    <?php if (!empty($address['complement'])): ?><?= e($address['complement']) ?><br><?php endif; ?>
                    <?= e(($address['district'] ?? '') . ' - ' . ($address['city'] ?? '') . '/' . ($address['state'] ?? '')) ?><br>
                    CEP <?= e($address['postal_code'] ?? '') ?>
                </p>
            </div>
            <div class="border-t border-white/10 pt-4">
                <span class="text-sm font-black uppercase tracking-[0.12em] text-text-muted">total</span>
                <strong class="mt-1 block text-2xl text-amber-glow"><?= money((float) ($order['total_amount'] ?: $order['total'])) ?></strong>
            </div>
            <a class="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black text-text-primary transition-all duration-300 hover:border-amber-accent hover:bg-amber-accent/10" href="<?= url('orders.php') ?>">Ver meus pedidos</a>
        </aside>
    </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
