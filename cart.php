<?php
require_once __DIR__ . '/config/helpers.php';
$items = cart_products();
$total = cart_total();
include __DIR__ . '/includes/header.php';
?>
<section class="section-head">
    <div>
        <p class="eyebrow">sacola</p>
        <h1>Carrinho</h1>
    </div>
</section>

<?php if (!$items): ?>
    <div class="glass-card p-6">
        <p class="empty">Seu carrinho está vazio.</p>
        <a class="btn primary mt-4" href="<?= url('products.php') ?>">Ver produtos</a>
    </div>
<?php else: ?>
    <div class="cart-layout">
        <div class="cart-list">
            <?php foreach ($items as $item): ?>
                <article class="cart-item">
                    <img src="<?= e(product_image($item['image_url'])) ?>" alt="<?= e($item['name']) ?>">
                    <div>
                        <h3 class="font-black"><?= e($item['name']) ?></h3>
                        <span class="muted"><?= money((float) $item['price']) ?> cada</span>
                    </div>
                    <form class="inline-actions" action="<?= url('api/cart-update.php') ?>" method="post">
                        <input type="hidden" name="product_id" value="<?= (int) $item['id'] ?>">
                        <input type="number" name="quantity" value="<?= (int) $item['quantity'] ?>" min="1" max="<?= max(1, (int) $item['stock']) ?>" aria-label="Quantidade">
                        <button class="btn small" type="submit">Atualizar</button>
                    </form>
                    <strong class="product-price"><?= money((float) $item['line_total']) ?></strong>
                    <form action="<?= url('api/cart-remove.php') ?>" method="post">
                        <input type="hidden" name="product_id" value="<?= (int) $item['id'] ?>">
                        <button class="link-danger" type="submit">Remover</button>
                    </form>
                </article>
            <?php endforeach; ?>
        </div>
        <aside class="summary">
            <p class="eyebrow">pedido</p>
            <h2 class="text-2xl font-black">Resumo</h2>
            <div><span>Subtotal</span><strong><?= money($total) ?></strong></div>
            <div><span>Entrega digital</span><strong>Instantânea</strong></div>
            <div class="total"><span>Total</span><strong><?= money($total) ?></strong></div>
            <a class="btn primary full mt-4" href="<?= url('checkout.php') ?>">Ir para checkout</a>
        </aside>
    </div>
<?php endif; ?>
<script src="<?= url('assets/js/cart.js') ?>"></script>
<?php include __DIR__ . '/includes/footer.php'; ?>
