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
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">orçamento</p>
        <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Solicitar <span class="gradient-text">atendimento</span></h1>
        <p class="mt-4 max-w-[44rem] leading-relaxed text-text-muted">Preencha o formulário e envie tudo direto para meu WhatsApp com a mensagem pronta.</p>
    </div>
</div>

<div class="grid items-start gap-5 lg:grid-cols-[1fr_0.85fr]">
    <section class="glass p-6">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">formulário</p>
        <form class="grid gap-4" method="get" data-budget-form data-whatsapp-phone="<?= e(preg_replace('/\D+/', '', WHATSAPP_CONTACT_NUMBER)) ?>">
            <div class="grid gap-4 md:grid-cols-2">
                <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                    <span>Seu nome</span>
                    <input name="name" value="<?= e($name) ?>" required class="input-field" placeholder="Seu nome">
                </label>
                <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                    <span>E-mail</span>
                    <input name="email" type="email" value="<?= e($email) ?>" class="input-field" placeholder="voce@email.com">
                </label>
            </div>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                <span>Empresa ou nome do projeto</span>
                <input name="company" value="<?= e($company) ?>" class="input-field" placeholder="Ex: loja, marca, canal, produto">
            </label>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                <span>O que você quer orçar?</span>
                <select name="service" class="input-field">
                    <?php foreach ($services as $service): ?>
                        <option value="<?= e($service) ?>" <?= $selectedService === $service ? 'selected' : '' ?> class="text-black"><?= e($service) ?></option>
                    <?php endforeach; ?>
                </select>
            </label>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                <span>Explique o objetivo</span>
                <textarea name="objective" rows="5" required class="input-field" placeholder="Conte o que você precisa, qual problema quer resolver e se já tem referências."><?= e($objective) ?></textarea>
            </label>
            <div class="grid gap-4 md:grid-cols-3">
                <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                    <span>Prazo desejado</span>
                    <input name="deadline" value="<?= e($deadline) ?>" class="input-field" placeholder="Ex: 15 dias">
                </label>
                <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                    <span>Orçamento estimado</span>
                    <input name="budget" value="<?= e($budget) ?>" class="input-field" placeholder="Ex: R$ 800">
                </label>
                <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                    <span>Melhor contato</span>
                    <input name="contact" value="<?= e($contact) ?>" class="input-field" placeholder="WhatsApp, e-mail...">
                </label>
            </div>
            <div class="flex flex-wrap gap-3">
                <button class="btn-ghost min-h-[44px]" type="submit">Atualizar mensagem</button>
                <a class="btn-primary" href="<?= e($whatsappLink) ?>" target="_blank" rel="noopener" data-whatsapp-submit>Enviar pelo WhatsApp</a>
            </div>
        </form>

        <div class="mt-6 rounded-[10px] border border-white/10 bg-background/60 p-4">
            <p class="mb-2 text-sm font-black text-amber-glow">Mensagem pronta</p>
            <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed text-text-secondary"><?= e($message) ?></pre>
        </div>

    </section>

    <aside class="glass p-6">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">status</p>
        <h2 class="m-0 text-2xl font-black text-amber-glow">Contato direto</h2>
        <p class="mt-3 leading-relaxed text-text-secondary">O formulário monta uma mensagem organizada para eu entender o serviço, objetivo, prazo e orçamento antes de responder.</p>
        <div class="mt-5 grid gap-3">
            <div class="rounded-[10px] border border-white/10 bg-background/50 p-4">
                <strong class="text-amber-glow">WhatsApp</strong>
                <p class="mt-2 text-text-secondary">Contato direto para orçamento, dúvidas e início de projeto.</p>
            </div>
            <div class="rounded-[10px] border border-white/10 bg-background/50 p-4">
                <strong class="text-amber-glow">Telegram</strong>
                <p class="mt-2 text-text-secondary">Canal para clientes acompanharem a comunidade e a prova social dos trabalhos.</p>
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
