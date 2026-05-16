<?php
require_once __DIR__ . '/config/helpers.php';
require_login();
$items = cart_products();
if (!$items) {
    flash('error', 'Adicione produtos ao carrinho antes do checkout.');
    redirect('products.php');
}
$user = current_user();
include __DIR__ . '/includes/header.php';
?>
<section class="section-head">
    <div>
        <p class="eyebrow">checkout seguro</p>
        <h1>Finalizar <span class="gradient-text">pedido</span></h1>
    </div>
</section>

<form class="checkout-grid" action="<?= url('api/checkout-create.php') ?>" method="post">
    <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
    <section class="panel">
        <p class="eyebrow">dados do cliente</p>
        <div class="grid gap-3 md:grid-cols-2">
            <label>
                <span class="muted">Nome</span>
                <input value="<?= e($user['name']) ?>" readonly>
            </label>
            <label>
                <span class="muted">E-mail</span>
                <input value="<?= e($user['email']) ?>" readonly>
            </label>
        </div>

        <div class="mt-8">
            <p class="eyebrow">pagamento</p>
            <div class="grid gap-3 payment-methods">
                <label class="payment-card">
                    <input type="radio" name="payment_method" value="pix" required checked>
                    <span><strong>Pix</strong><small class="block muted">Pedido criado com pagamento Pix pendente.</small></span>
                </label>
                <label class="payment-card">
                    <input type="radio" name="payment_method" value="mercadopago" required>
                    <span><strong>Mercado Pago</strong><small class="block muted">Estrutura pronta para criar pagamento no provedor.</small></span>
                </label>
                <label class="payment-card">
                    <input type="radio" name="payment_method" value="paypal" required>
                    <span><strong>PayPal</strong><small class="block muted">Estrutura pronta para criar ordem PayPal.</small></span>
                </label>
            </div>
            <p class="muted mt-4">Modo mock ativo. O pedido será criado com status de pagamento pendente.</p>
            <button class="btn primary mt-5" type="submit" data-checkout-submit>Continuar para pagamento</button>
        </div>
    </section>
    <aside class="summary">
        <p class="eyebrow">resumo</p>
        <h2 class="text-2xl font-black">Itens</h2>
        <?php foreach ($items as $item): ?>
            <div><span><?= e($item['name']) ?> x<?= (int) $item['quantity'] ?></span><strong><?= money((float) $item['line_total']) ?></strong></div>
        <?php endforeach; ?>
        <div class="total"><span>Total</span><strong><?= money(cart_total()) ?></strong></div>
    </aside>
</form>
<?php include __DIR__ . '/includes/footer.php'; ?>
