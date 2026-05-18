<?php
require_once __DIR__ . '/config/helpers.php';
require_login();
$items = cart_products();
if (!$items) {
    flash('error', 'Adicione produtos ao carrinho antes do checkout.');
    redirect('products.php');
}
$user = current_user();
$total = cart_total();
$pixPayload = pix_br_code($total, 'CAFESTORE' . (int) $user['id']);
$pixQrUrl = qr_code_image_url($pixPayload, 260);
include __DIR__ . '/includes/header.php';
?>
<div class="flex items-end justify-between gap-6 mb-6">
    <div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">checkout seguro</p>
        <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Finalizar <span class="bg-gradient-to-r from-ember-500 to-glow-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,107,0,0.8)]">pedido</span></h1>
    </div>
</div>

<form class="grid items-start gap-6 max-md:grid-cols-1 md:grid-cols-[1fr_380px]" action="<?= url('api/checkout-create.php') ?>" method="post">
    <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
    <input type="hidden" name="pix_payload" value="<?= e($pixPayload) ?>">
    <section class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <div class="mb-6 rounded-[10px] border border-glow-400/40 bg-glow-400/10 p-4">
            <strong class="block text-glow-400">Confirmação de apoio</strong>
            <p class="mt-2 text-sm leading-relaxed text-midnight-300">Você está realizando um apoio/donate para a CAFÉ STORE. Os itens desta aba não são serviços e a entrega física depende de campanha oficial de produção.</p>
        </div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">dados do cliente</p>
        <div class="grid gap-3 md:grid-cols-2">
            <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">
                <span>Nome</span>
                <input value="<?= e($user['name']) ?>" readonly class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur">
            </label>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">
                <span>E-mail</span>
                <input value="<?= e($user['email']) ?>" readonly class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur">
            </label>
        </div>
        <div class="mt-8 grid gap-5">
            <div>
                <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">pagamento</p>
                <div class="grid gap-3 md:grid-cols-3">
                    <label class="flex cursor-pointer items-center gap-3 rounded-[10px] border border-glow-400 bg-glow-400/10 p-3.5 transition-all duration-300 has-[:checked]:bg-glow-400/15">
                        <input type="radio" name="payment_method" value="pix" required checked class="w-auto min-h-auto accent-ember-500" data-payment-toggle="pix">
                        <span><strong>Pix</strong><small class="mt-1 block text-midnight-400">QR Code e copia-e-cola.</small></span>
                    </label>
                    <label class="flex cursor-not-allowed items-center gap-3 rounded-[10px] border border-white/10 bg-white/5 p-3.5 opacity-60 transition-all duration-300">
                        <input type="radio" value="mercadopago" disabled class="w-auto min-h-auto accent-ember-500" data-payment-toggle="mercadopago">
                        <span><strong>Mercado Pago</strong><small class="mt-1 block text-midnight-400">Em preparação.</small></span>
                    </label>
                    <label class="flex cursor-not-allowed items-center gap-3 rounded-[10px] border border-white/10 bg-white/5 p-3.5 opacity-60 transition-all duration-300">
                        <input type="radio" value="paypal" disabled class="w-auto min-h-auto accent-ember-500" data-payment-toggle="paypal">
                        <span><strong>PayPal</strong><small class="mt-1 block text-midnight-400">Em preparação.</small></span>
                    </label>
                </div>
            </div>

            <section class="overflow-hidden rounded-2xl border border-glow-400/40 bg-midnight-950/75" data-payment-panel="pix">
                <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-white/[0.03] p-5">
                    <div>
                        <p class="mb-1 text-[0.72rem] font-black uppercase tracking-[0.12em] text-glow-400">Pix instantâneo</p>
                        <h2 class="m-0 text-2xl font-black text-white">Pague com QR Code ou copia e cola</h2>
                    </div>
                    <div class="rounded-[10px] border border-glow-400/30 bg-glow-400/10 px-4 py-3 text-right">
                        <span class="block text-xs font-black uppercase tracking-[0.12em] text-midnight-300">valor</span>
                        <strong class="text-xl font-black text-glow-400"><?= money($total) ?></strong>
                    </div>
                </div>

                <div class="grid gap-6 p-5 xl:grid-cols-[300px_minmax(0,1fr)]">
                    <div class="grid content-start justify-items-center gap-3">
                        <div class="grid h-[280px] w-[280px] place-items-center rounded-2xl border border-white/10 bg-white p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] max-sm:h-[min(76vw,280px)] max-sm:w-[min(76vw,280px)]">
                            <img src="<?= e($pixQrUrl) ?>" alt="QR Code Pix" class="h-full w-full object-contain">
                        </div>
                        <p class="m-0 max-w-[280px] text-center text-sm leading-relaxed text-midnight-400">Escaneie com a câmera Pix do app do seu banco.</p>
                    </div>

                    <div class="grid min-w-0 gap-4">
                        <div class="grid gap-3 md:grid-cols-3">
                            <div class="rounded-[10px] border border-white/10 bg-white/5 p-3">
                                <span class="text-xs font-black uppercase tracking-[0.12em] text-glow-400">1</span>
                                <p class="mt-1 text-sm font-bold text-midnight-200">Abra o app do banco</p>
                            </div>
                            <div class="rounded-[10px] border border-white/10 bg-white/5 p-3">
                                <span class="text-xs font-black uppercase tracking-[0.12em] text-glow-400">2</span>
                                <p class="mt-1 text-sm font-bold text-midnight-200">Use QR Code ou copia e cola</p>
                            </div>
                            <div class="rounded-[10px] border border-white/10 bg-white/5 p-3">
                                <span class="text-xs font-black uppercase tracking-[0.12em] text-glow-400">3</span>
                                <p class="mt-1 text-sm font-bold text-midnight-200">Confirme o apoio aqui</p>
                            </div>
                        </div>

                        <div class="rounded-2xl border border-white/10 bg-black/30 p-4">
                            <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
                                <p class="m-0 text-sm font-black text-glow-400">Pix copia e cola</p>
                                <button class="inline-flex min-h-[36px] items-center justify-center rounded-[8px] border border-white/20 bg-white/5 px-3 text-sm font-black text-white transition-all duration-300 hover:border-glow-400" type="button" data-copy-target="pix-payload">Copiar código</button>
                            </div>
                            <textarea id="pix-payload" readonly rows="4" class="block w-full resize-none overflow-auto rounded-[10px] border border-white/10 bg-midnight-950/90 p-3 font-mono text-[0.78rem] leading-relaxed text-midnight-100 outline-none"><?= e($pixPayload) ?></textarea>
                        </div>

                        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
                                <p class="m-0 text-sm font-black text-glow-400">Chave Pix</p>
                                <button class="inline-flex min-h-[36px] items-center justify-center rounded-[8px] border border-white/20 bg-white/5 px-3 text-sm font-black text-white transition-all duration-300 hover:border-glow-400" type="button" data-copy-target="pix-key">Copiar chave</button>
                            </div>
                            <code id="pix-key" class="block max-w-full overflow-x-auto whitespace-nowrap rounded-[10px] bg-midnight-950/80 p-3 font-mono text-sm text-midnight-100"><?= e(PIX_KEY) ?></code>
                        </div>

                        <div class="rounded-[10px] border border-glow-400/30 bg-glow-400/10 p-4">
                            <p class="m-0 text-sm leading-relaxed text-midnight-200">Depois de pagar no banco, clique em <strong class="text-glow-400">Confirmar apoio</strong>. O pedido será criado como pendente até a validação do pagamento.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="hidden rounded-2xl border border-white/10 bg-white/5 p-5" data-payment-panel="mercadopago">
                <h2 class="m-0 text-xl font-black text-glow-400">Mercado Pago</h2>
                <p class="mt-3 text-midnight-400">Esta forma será ativada quando as credenciais reais estiverem configuradas. Use Pix por enquanto.</p>
            </section>

            <section class="hidden rounded-2xl border border-white/10 bg-white/5 p-5" data-payment-panel="paypal">
                <h2 class="m-0 text-xl font-black text-glow-400">PayPal</h2>
                <p class="mt-3 text-midnight-400">Esta forma será ativada quando as credenciais reais estiverem configuradas. Use Pix por enquanto.</p>
            </section>

            <div>
                <p class="text-sm text-midnight-400">O pagamento Pix depende da confirmação no seu banco. O pedido fica pendente até validação manual/operacional.</p>
                <button class="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)] animate-pulse-glow" type="submit" data-checkout-submit>Confirmar apoio</button>
            </div>
        </div>
    </section>
    <aside class="sticky rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg" style="top:calc(72px + 24px);">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">resumo</p>
        <h2 class="m-0 mb-3 text-[1.5rem] font-black bg-gradient-to-r from-ember-500 to-glow-400 bg-clip-text text-transparent">Produtos de apoio</h2>
        <?php foreach ($items as $item): ?>
            <div class="flex justify-between gap-4 border-b border-white/10 py-3"><span><?= e($item['name']) ?> x<?= (int) $item['quantity'] ?></span><strong><?= money((float) $item['line_total']) ?></strong></div>
        <?php endforeach; ?>
        <div class="flex justify-between gap-4 py-3 text-glow-400 text-[1.12rem] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"><span>Total</span><strong><?= money(cart_total()) ?></strong></div>
    </aside>
</form>
<script>
document.querySelectorAll('[data-payment-toggle]').forEach((input) => {
    input.addEventListener('change', () => {
        document.querySelectorAll('[data-payment-panel]').forEach((panel) => {
            panel.classList.toggle('hidden', panel.dataset.paymentPanel !== input.value);
        });
    });
});

document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
        const target = document.getElementById(button.dataset.copyTarget);
        const text = target ? ('value' in target ? target.value : target.textContent) : '';
        if (!text) return;
        await navigator.clipboard.writeText(text.trim());
        const original = button.textContent;
        button.textContent = 'Copiado';
        setTimeout(() => { button.textContent = original; }, 1400);
    });
});
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>
