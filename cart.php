<?php
require_once __DIR__ . '/config/helpers.php';
$items = cart_products();
$total = cart_total();
include __DIR__ . '/includes/header.php';
?>
<div class="flex items-end justify-between gap-6 mb-6">
    <div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">sacola</p>
        <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Carrinho</h1>
    </div>
</div>

<section class="mb-6 rounded-2xl border border-glow-400/40 bg-glow-400/10 p-5 backdrop-blur-lg">
    <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">transparência</p>
    <p class="m-0 leading-relaxed text-midnight-300">Os itens em Produtos são apoios/donates para a CAFÉ STORE. Eles representam apoio ao projeto; entrega física depende de campanha oficial de produção.</p>
</section>

<?php if (!$items): ?>
    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <p class="text-midnight-400">Seu carrinho está vazio.</p>
        <a class="mt-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)]" href="<?= url('products.php') ?>">Ver produtos</a>
    </div>
<?php else: ?>
    <div class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[1fr_360px]">
        <div class="grid gap-3.5">
            <?php foreach ($items as $item): ?>
                <article class="grid items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-lg max-md:grid-cols-[82px_1fr] md:grid-cols-[92px_1fr_190px_120px_auto]">
                    <img src="<?= e(product_main_image($item)) ?>" alt="<?= e($item['name']) ?>" class="aspect-[4/3] w-[92px] rounded-[10px] bg-midnight-900 object-cover max-md:h-[68px] max-md:w-[82px]">
                    <div>
                        <h3 class="m-0 mb-1 font-black leading-tight"><?= e($item['name']) ?></h3>
                        <span class="text-midnight-400"><?= money((float) $item['price']) ?> cada</span>
                    </div>
                    <form class="flex flex-wrap items-center gap-3" action="<?= url('api/cart-update.php') ?>" method="post">
                        <input type="hidden" name="product_id" value="<?= (int) $item['id'] ?>">
                        <input type="number" name="quantity" value="<?= (int) $item['quantity'] ?>" min="1" max="<?= max(1, (int) $item['stock']) ?>" aria-label="Quantidade" class="w-full min-h-[36px] max-w-[86px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400">
                        <button class="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-3 text-[0.86rem] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-glow-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]" type="submit">Atualizar</button>
                    </form>
                    <strong class="text-[clamp(1.8rem,4vw,2.8rem)] font-black text-glow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><?= money((float) $item['line_total']) ?></strong>
                    <form action="<?= url('api/cart-remove.php') ?>" method="post">
                        <input type="hidden" name="product_id" value="<?= (int) $item['id'] ?>">
                        <button class="border-0 bg-transparent cursor-pointer font-black text-fire-300 transition-all duration-300 hover:text-fire-500 hover:drop-shadow-[0_0_10px_rgba(255,60,56,0.5)]" type="submit">Remover</button>
                    </form>
                </article>
            <?php endforeach; ?>
        </div>
        <aside class="sticky rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg" style="top:calc(72px + 24px);">
            <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">pedido</p>
            <h2 class="m-0 mb-3 text-[1.5rem] font-black bg-gradient-to-r from-ember-500 to-glow-400 bg-clip-text text-transparent">Resumo</h2>
            <div class="flex justify-between gap-4 border-b border-white/10 py-3"><span>Subtotal do apoio</span><strong><?= money($total) ?></strong></div>
            <div class="flex justify-between gap-4 border-b border-white/10 py-3"><span>Entrega</span><strong>A confirmar</strong></div>
            <div class="flex justify-between gap-4 py-3 text-glow-400 text-[1.12rem] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><span>Total</span><strong><?= money($total) ?></strong></div>
            <a class="mt-4 inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)] animate-pulse-glow" href="<?= url('checkout.php') ?>">Continuar apoio</a>
        </aside>
    </div>
<?php endif; ?>
<script src="<?= url('assets/js/cart.js') ?>"></script>
<?php include __DIR__ . '/includes/footer.php'; ?>
