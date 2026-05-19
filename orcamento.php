<?php
require_once __DIR__ . '/config/helpers.php';

$services = [
    'Agência digital completa',
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

$user = current_user();
$name = trim((string) ($_GET['name'] ?? ($user['name'] ?? '')));
$email = trim((string) ($_GET['email'] ?? ($user['email'] ?? '')));
$company = trim((string) ($_GET['company'] ?? ''));
$objective = trim((string) ($_GET['objective'] ?? ''));
$deadline = trim((string) ($_GET['deadline'] ?? ''));
$budget = trim((string) ($_GET['budget'] ?? ''));
$contact = trim((string) ($_GET['contact'] ?? ''));

$message = implode("\n", [
    'Olá, vim pelo site da CAFÉ STORE.',
    'Quero solicitar um orçamento.',
    '',
    'Nome: ' . ($name !== '' ? $name : 'não informado'),
    'E-mail: ' . ($email !== '' ? $email : 'não informado'),
    'Empresa/projeto: ' . ($company !== '' ? $company : 'não informado'),
    'Serviço de interesse: ' . $selectedService,
    'Objetivo: ' . ($objective !== '' ? $objective : 'quero entender valores, prazo e próximos passos para meu negócio.'),
    'Prazo desejado: ' . ($deadline !== '' ? $deadline : 'não informado'),
    'Orçamento estimado: ' . ($budget !== '' ? $budget : 'não informado'),
    'Melhor contato: ' . ($contact !== '' ? $contact : 'WhatsApp'),
]);
$whatsappLink = whatsapp_url($message);

include __DIR__ . '/includes/header.php';
?>
<div class="flex items-end justify-between gap-6 mb-6">
    <div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">orçamento</p>
        <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Solicitar <span class="bg-gradient-to-r from-ember-500 to-glow-400 bg-clip-text text-transparent">atendimento</span></h1>
        <p class="mt-4 max-w-[44rem] leading-relaxed text-midnight-400">Preencha o formulário e envie tudo direto para meu WhatsApp com a mensagem pronta.</p>
    </div>
</div>

<div class="grid items-start gap-5 lg:grid-cols-[1fr_0.85fr]">
    <section class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">formulário</p>
        <form class="grid gap-4" method="get" data-budget-form data-whatsapp-phone="<?= e(preg_replace('/\D+/', '', WHATSAPP_CONTACT_NUMBER)) ?>">
            <div class="grid gap-4 md:grid-cols-2">
                <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">
                    <span>Seu nome</span>
                    <input name="name" value="<?= e($name) ?>" required class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" placeholder="Seu nome">
                </label>
                <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">
                    <span>E-mail</span>
                    <input name="email" type="email" value="<?= e($email) ?>" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" placeholder="voce@email.com">
                </label>
            </div>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">
                <span>Empresa ou nome do projeto</span>
                <input name="company" value="<?= e($company) ?>" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" placeholder="Ex: loja, marca, canal, produto">
            </label>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">
                <span>O que você quer orçar?</span>
                <select name="service" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400">
                    <?php foreach ($services as $service): ?>
                        <option value="<?= e($service) ?>" <?= $selectedService === $service ? 'selected' : '' ?> class="text-black"><?= e($service) ?></option>
                    <?php endforeach; ?>
                </select>
            </label>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">
                <span>Explique o objetivo</span>
                <textarea name="objective" rows="5" required class="w-full min-h-[132px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" placeholder="Conte o que você precisa, qual problema quer resolver e se já tem referências."><?= e($objective) ?></textarea>
            </label>
            <div class="grid gap-4 md:grid-cols-3">
                <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">
                    <span>Prazo desejado</span>
                    <input name="deadline" value="<?= e($deadline) ?>" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" placeholder="Ex: 15 dias">
                </label>
                <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">
                    <span>Orçamento estimado</span>
                    <input name="budget" value="<?= e($budget) ?>" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" placeholder="Ex: R$ 800">
                </label>
                <label class="grid gap-1.5 text-[0.9rem] font-black text-midnight-400">
                    <span>Melhor contato</span>
                    <input name="contact" value="<?= e($contact) ?>" class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400" placeholder="WhatsApp, e-mail...">
                </label>
            </div>
            <div class="flex flex-wrap gap-3">
                <button class="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black text-white transition-all duration-300 hover:border-glow-400" type="submit">Atualizar mensagem</button>
                <a class="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-glow-400 bg-glow-400 px-[18px] font-black text-midnight-950 transition-all duration-300 hover:bg-glow-300" href="<?= e($whatsappLink) ?>" target="_blank" rel="noopener" data-whatsapp-submit>Enviar pelo WhatsApp</a>
            </div>
        </form>

        <div class="mt-6 rounded-[10px] border border-white/10 bg-midnight-950/70 p-4">
            <p class="mb-2 text-sm font-black text-glow-400">Mensagem pronta</p>
            <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed text-midnight-300"><?= e($message) ?></pre>
        </div>

    </section>

    <aside class="rounded-2xl border border-glow-400/40 bg-glow-400/10 p-6 backdrop-blur-lg">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">status</p>
        <h2 class="m-0 text-2xl font-black text-glow-400">Contato direto</h2>
        <p class="mt-3 leading-relaxed text-midnight-300">O formulário monta uma mensagem organizada para eu entender o serviço, objetivo, prazo e orçamento antes de responder.</p>
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
<script>
(() => {
    const form = document.querySelector('[data-budget-form]');
    const button = document.querySelector('[data-whatsapp-submit]');
    if (!form || !button) return;

    const value = (name, fallback = 'não informado') => {
        const field = form.elements[name];
        const text = field ? String(field.value || '').trim() : '';
        return text || fallback;
    };

    const updateLink = () => {
        const message = [
            'Olá, vim pelo site da CAFÉ STORE.',
            'Quero solicitar um orçamento.',
            '',
            `Nome: ${value('name')}`,
            `E-mail: ${value('email')}`,
            `Empresa/projeto: ${value('company')}`,
            `Serviço de interesse: ${value('service', 'Sites institucionais')}`,
            `Objetivo: ${value('objective', 'quero entender valores, prazo e próximos passos para meu negócio.')}`,
            `Prazo desejado: ${value('deadline')}`,
            `Orçamento estimado: ${value('budget')}`,
            `Melhor contato: ${value('contact', 'WhatsApp')}`,
        ].join('\n');

        button.href = `https://wa.me/${form.dataset.whatsappPhone}?text=${encodeURIComponent(message)}`;
    };

    form.addEventListener('input', updateLink);
    form.addEventListener('change', updateLink);
    button.addEventListener('click', updateLink);
    updateLink();
})();
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>
