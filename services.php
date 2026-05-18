<?php
require_once __DIR__ . "/config/helpers.php";

$services = [
    [
        "name" => "Sites institucionais",
        "tag" => "site",
        "price" => "Sob orçamento",
        "description" =>
            "Criação de sites profissionais para apresentar sua empresa, serviços, diferenciais e canais de contato.",
        "items" => [
            "Layout responsivo",
            "Páginas essenciais",
            "Formulário de contato",
        ],
    ],
    [
        "name" => "Landing pages",
        "tag" => "conversão",
        "price" => "Sob orçamento",
        "description" =>
            "Páginas diretas para campanhas, lançamentos, captura de leads e venda de uma oferta específica.",
        "items" => ["Seção de oferta", "CTA claro", "Integração combinada"],
    ],
    [
        "name" => "Vídeos curtos",
        "tag" => "shorts",
        "price" => "Sob orçamento",
        "description" =>
            "Edição de vídeos em formato curto para Reels, Shorts, TikTok, anúncios rápidos e redes sociais.",
        "items" => ["Cortes objetivos", "Legendas", "Formato vertical"],
    ],
    [
        "name" => "Vídeos longos",
        "tag" => "conteúdo",
        "price" => "Sob orçamento",
        "description" =>
            "Edição de vídeos completos para YouTube, aulas, apresentações, institucionais e conteúdos de marca.",
        "items" => [
            "Ritmo narrativo",
            "Tratamento de áudio",
            "Entrega finalizada",
        ],
    ],
    [
        "name" => "Web aplicações",
        "tag" => "sistema",
        "price" => "Sob orçamento",
        "description" =>
            "Desenvolvimento de aplicações web com a stack adequada para automatizar processos, vender online ou organizar sua operação.",
        "items" => [
            "React, Vue.js ou Next.js",
            "APIs e integrações",
            "Cloudinary, Render e outras soluções",
        ],
    ],
];

include __DIR__ . "/includes/header.php";
?>

<section class="grid items-center gap-8 py-8 md:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)] md:py-14">
    <div class="max-w-[680px]">
        <p class="mb-4 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">agência digital</p>
        <h1 class="m-0 max-w-[660px] text-[clamp(2.55rem,4.8vw,4.35rem)] font-black leading-[1.08]">
            <span class="block text-white">Soluções digitais</span>
            <span class="mt-3 block text-glow-400">CAFÉ STORE</span>
        </h1>
        <p class="mt-7 max-w-[40rem] text-[clamp(1rem,1.5vw,1.16rem)] leading-relaxed text-midnight-400">Eu faço sites, landing pages, vídeos curtos, vídeos longos e web aplicações para o seu negócio. Cada produto digital tem escopo, prazo e entrega definidos antes do início.</p>
        <div class="mt-8 flex flex-wrap gap-3">
            <a class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-glow-400 px-[18px] font-black leading-none text-midnight-950 transition-all duration-300 hover:bg-glow-300" href="#serviços">Ver soluções</a>
            <a class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white transition-all duration-300 hover:border-glow-400 hover:bg-white/10" href="<?= url(
                "products.php",
            ) ?>">Ver produtos</a>
        </div>
    </div>
    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">como funciona</p>
        <div class="grid gap-4">
            <div class="rounded-[10px] border border-white/10 bg-midnight-950/70 p-4">
                <strong class="text-glow-400">1. Briefing</strong>
                <p class="mt-2 text-midnight-400">Você explica seu objetivo, público, prazo e o que o negócio precisa resolver.</p>
            </div>
            <div class="rounded-[10px] border border-white/10 bg-midnight-950/70 p-4">
                <strong class="text-glow-400">2. Orçamento</strong>
                <p class="mt-2 text-midnight-400">O valor é definido pelo produto escolhido e pelo escopo real da entrega.</p>
            </div>
            <div class="rounded-[10px] border border-white/10 bg-midnight-950/70 p-4">
                <strong class="text-glow-400">3. Entrega online</strong>
                <p class="mt-2 text-midnight-400">O projeto é entregue digitalmente, com revisão e orientação de uso conforme combinado.</p>
            </div>
        </div>
    </div>
</section>

<section id="serviços" class="mt-4">
    <div class="mb-6 flex items-end justify-between gap-6">
        <div>
            <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">catálogo de produtos digitais</p>
            <h2 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight text-ember-400">O que posso fazer pelo seu negócio</h2>
        </div>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
        <?php foreach ($services as $service): ?>
            <article class="flex min-h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-ember-500/40">
                <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <span class="inline-flex w-fit items-center justify-center rounded-full border border-white/20 px-[9px] py-[4px] text-[0.76rem] font-bold leading-none text-glow-400"><?= e(
                        $service["tag"],
                    ) ?></span>
                    <strong class="text-glow-400"><?= e(
                        $service["price"],
                    ) ?></strong>
                </div>
                <h3 class="m-0 text-xl font-black text-white"><?= e(
                    $service["name"],
                ) ?></h3>
                <p class="mt-3 leading-relaxed text-midnight-400"><?= e(
                    $service["description"],
                ) ?></p>
                <ul class="mt-4 grid gap-2 text-midnight-300">
                    <?php foreach ($service["items"] as $item): ?>
                        <li class="rounded-[10px] border border-white/10 bg-midnight-950/60 px-3 py-2"><?= e(
                            $item,
                        ) ?></li>
                    <?php endforeach; ?>
                </ul>
                <a class="mt-5 inline-flex min-h-[44px] w-fit items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white transition-all duration-300 hover:border-glow-400 hover:bg-white/10" href="<?= url(
                    'orcamento.php?service=' . urlencode($service['name']),
                ) ?>">Solicitar orçamento</a>
            </article>
        <?php endforeach; ?>
    </div>
</section>

<section class="mt-14 rounded-2xl border border-glow-400/40 bg-glow-400/10 p-6 backdrop-blur-lg">
    <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">produtos separados</p>
    <h2 class="m-0 text-2xl font-black text-glow-400">Cada solução fica em uma categoria própria.</h2>
    <p class="mt-3 max-w-[56rem] leading-relaxed text-midnight-300">Na aba Produtos você encontra site, landing page, vídeo curto, vídeo longo e web aplicação separadamente, para escolher exatamente o que seu negócio precisa contratar.</p>
</section>

<?php include __DIR__ . "/includes/footer.php"; ?>
