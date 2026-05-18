<?php
require_once __DIR__ . '/config/helpers.php';
require_login();

$user = current_user();
$services = [
    'Sites institucionais',
    'Landing pages',
    'Vídeos curtos',
    'Vídeos longos',
    'Web aplicações',
];
$selectedService = trim((string) ($_GET['service'] ?? ''));
if (!in_array($selectedService, $services, true)) {
    $selectedService = $services[0];
}

$isClient = user_has_client_history((int) $user['id']);
$message = implode("\n", [
    'Olá, vim pelo site da CAFÉ STORE.',
    'Quero solicitar um orçamento.',
    '',
    'Nome: ' . $user['name'],
    'E-mail: ' . $user['email'],
    'Serviço de interesse: ' . $selectedService,
    'Objetivo: quero entender valores, prazo e próximos passos para meu negócio.',
]);
$whatsappLink = whatsapp_url($message);

include __DIR__ . '/includes/header.php';
?>
<div class="flex items-end justify-between gap-6 mb-6">
    <div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">orçamento</p>
        <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Solicitar <span class="bg-gradient-to-r from-ember-500 to-glow-400 bg-clip-text text-transparent">atendimento</span></h1>
        <p class="mt-4 max-w-[44rem] leading-relaxed text-midnight-400">Escolha o serviço e use a mensagem pronta para abrir o WhatsApp sem precisar digitar tudo do zero.</p>
    </div>
</div>

<div class="grid items-start gap-5 lg:grid-cols-[1fr_0.85fr]">
    <section class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">serviço</p>
        <form class="grid gap-4" method="get">
            <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">
                <span>O que você quer orçar?</span>
                <select name="service" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400">
                    <?php foreach ($services as $service): ?>
                        <option value="<?= e($service) ?>" <?= $selectedService === $service ? 'selected' : '' ?> class="text-black"><?= e($service) ?></option>
                    <?php endforeach; ?>
                </select>
            </label>
            <button class="inline-flex min-h-[44px] w-fit items-center justify-center rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black text-white transition-all duration-300 hover:border-glow-400" type="submit">Atualizar mensagem</button>
        </form>

        <div class="mt-6 rounded-[10px] border border-white/10 bg-midnight-950/70 p-4">
            <p class="mb-2 text-sm font-black text-glow-400">Mensagem pronta</p>
            <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed text-midnight-300"><?= e($message) ?></pre>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
            <?php if ($isClient): ?>
                <a class="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-glow-400 bg-glow-400 px-[18px] font-black text-midnight-950 transition-all duration-300 hover:bg-glow-300" href="<?= e(TELEGRAM_CLIENT_CHANNEL_URL) ?>" target="_blank" rel="noopener">Entrar no canal de clientes</a>
                <a class="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black text-white transition-all duration-300 hover:border-glow-400" href="<?= e($whatsappLink) ?>" target="_blank" rel="noopener">Enviar novo orçamento</a>
            <?php else: ?>
                <a class="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-glow-400 bg-glow-400 px-[18px] font-black text-midnight-950 transition-all duration-300 hover:bg-glow-300" href="<?= e($whatsappLink) ?>" target="_blank" rel="noopener">Enviar pelo WhatsApp</a>
            <?php endif; ?>
        </div>
    </section>

    <aside class="rounded-2xl border border-glow-400/40 bg-glow-400/10 p-6 backdrop-blur-lg">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">status</p>
        <h2 class="m-0 text-2xl font-black text-glow-400"><?= $isClient ? 'Cliente confirmado' : 'Novo cliente' ?></h2>
        <p class="mt-3 leading-relaxed text-midnight-300">
            <?= $isClient
                ? 'Como você já tem pedido aprovado, o canal de clientes no Telegram é o melhor lugar para acompanhar comunidade, provas de trabalho e atualizações.'
                : 'Como este é seu primeiro contato, o relatório vai direto para meu WhatsApp para eu entender seu projeto e responder com mais precisão.' ?>
        </p>
        <div class="mt-5 grid gap-3">
            <div class="rounded-[10px] border border-white/10 bg-midnight-950/60 p-4">
                <strong class="text-glow-400">WhatsApp</strong>
                <p class="mt-2 text-midnight-300">Contato direto para orçamento, dúvidas e início de projeto.</p>
            </div>
            <div class="rounded-[10px] border border-white/10 bg-midnight-950/60 p-4">
                <strong class="text-glow-400">Telegram</strong>
                <p class="mt-2 text-midnight-300">Canal para clientes acompanharem a comunidade e a prova social dos trabalhos.</p>
            </div>
        </div>
    </aside>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
