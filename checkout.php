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
            <div class="grid gap-3">
                <label class="radio-card"><input type="radio" name="payment_method" value="pix" checked> <span><strong>Pix</strong><small class="block muted">Confirmação rápida no ambiente real</small></span></label>
                <label class="radio-card"><input type="radio" name="payment_method" value="card"> <span><strong>Cartão</strong><small class="block muted">Crédito ou débito via provedor</small></span></label>
                <div class="payment-card"><strong>Mercado Pago</strong><small class="block muted">Provider preparado para a integração de pagamentos.</small></div>
            </div>
            <p class="muted mt-4">Modo mock ativo. O pedido será criado com status de pagamento pendente.</p>
            <button class="btn primary mt-5" type="submit" data-checkout-submit>Criar pedido</button>
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
