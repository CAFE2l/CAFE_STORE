<?php
require_once __DIR__ . "/config/helpers.php";

$services = [
    [
        "name" => "Agência digital completa",
        "tag" => "pacote completo",
        "price" => "R$ 9.500,00",
        "deadline" => "32 a 48 dias",
        "description" =>
            "Pacote completo para estruturar presença digital, apresentação comercial, identidade visual básica, vídeos e documentação do negócio.",
        "result" =>
            "Um pacote fechado para lançar ou organizar sua marca com site, sistema, peças visuais, vídeos e material de apresentação.",
        "image" => "assets/uploads/feedbacks/feedback-3-668473c4895b.png",
        "portfolio" => "feedbacks.php",
        "testimonial" =>
            "O pacote juntou tudo que precisávamos para apresentar o negócio com mais clareza e profissionalismo.",
        "items" => [
            "1 web app",
            "2 banners",
            "1 ícone e 1 favicon",
            "3 vídeos curtos (30 segundos máx.)",
            "1 vídeo longo",
            "1 landing page",
            "1 apresentação de 10 slides para apresentar o seu negócio",
            "1 documentação (15 páginas, dependendo pode variar)",
        ],
    ],
    [
        "name" => "Sites institucionais",
        "tag" => "site",
        "price" => "Sob orçamento",
        "deadline" => "7 a 15 dias",
        "description" =>
            "Criação de sites profissionais para apresentar sua empresa, serviços, diferenciais e canais de contato.",
        "result" =>
            "Presença profissional pronta para converter visitantes em contatos qualificados.",
        "image" => "assets/uploads/feedbacks/feedback-3-668473c4895b.png",
        "portfolio" => "feedbacks.php?category=Site",
        "testimonial" =>
            "O site deixou nossa apresentação mais clara e facilitou o contato de novos clientes.",
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
        "deadline" => "5 a 10 dias",
        "description" =>
            "Páginas diretas para campanhas, lançamentos, captura de leads e venda de uma oferta específica.",
        "result" =>
            "Página focada em uma ação principal, com mensagem objetiva e CTA visível.",
        "image" => "assets/images/banners/Produtos.png",
        "portfolio" => "feedbacks.php?category=Landing page",
        "testimonial" =>
            "A landing page organizou a oferta e ajudou a explicar o produto sem enrolação.",
        "items" => ["Seção de oferta", "CTA claro", "Integração combinada"],
    ],
    [
        "name" => "Vídeos curtos",
        "tag" => "shorts",
        "price" => "Sob orçamento",
        "deadline" => "2 a 5 dias",
        "description" =>
            "Edição de vídeos em formato curto para Reels, Shorts, TikTok, anúncios rápidos e redes sociais.",
        "result" =>
            "Conteúdo curto com ritmo, legenda e estrutura para segurar atenção nos primeiros segundos.",
        "image" => "assets/images/mascote.png",
        "portfolio" => "feedbacks.php?category=Vídeo curto",
        "testimonial" =>
            "Os cortes ficaram mais dinâmicos e prontos para postar nas redes.",
        "items" => ["Cortes objetivos", "Legendas", "Formato vertical"],
    ],
    [
        "name" => "Vídeos longos",
        "tag" => "conteúdo",
        "price" => "Sob orçamento",
        "deadline" => "5 a 12 dias",
        "description" =>
            "Edição de vídeos completos para YouTube, aulas, apresentações, institucionais e conteúdos de marca.",
        "result" =>
            "Vídeo final com narrativa mais limpa, áudio tratado e entrega organizada.",
        "image" => "assets/images/mascote.png",
        "portfolio" => "feedbacks.php?category=Vídeo longo",
        "testimonial" =>
            "O vídeo ficou mais profissional e bem mais fácil de assistir do começo ao fim.",
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
        "deadline" => "21 a 35 dias",
        "description" =>
            "Desenvolvimento de aplicações web com a stack adequada para automatizar processos, vender online ou organizar sua operação.",
        "result" =>
            "Sistema online sob medida para reduzir trabalho manual e centralizar processos.",
        "image" => "assets/uploads/feedbacks/feedback-3-668473c4895b.png",
        "portfolio" => "feedbacks.php?category=Sistema",
        "testimonial" =>
            "A aplicação deixou o processo mais simples e economizou tempo na operação.",
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

    <div class="grid gap-5 lg:grid-cols-2">
        <?php foreach ($services as $service): ?>
            <article class="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl shadow-[0_18px_48px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-ember-500/45 hover:shadow-[0_24px_58px_rgba(0,0,0,0.36),0_0_26px_rgba(255,107,0,0.12)]">
                <div class="overflow-hidden rounded-[14px] border border-white/10 bg-midnight-950">
                    <img src="<?= e(url($service["image"])) ?>" alt="Resultado de <?= e($service["name"]) ?>" class="aspect-[16/9] w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100">
                </div>

                <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <span class="inline-flex w-fit items-center justify-center rounded-full border border-glow-400/35 bg-glow-400/10 px-3 py-1 text-[0.76rem] font-black leading-none text-glow-400"><?= e($service["tag"]) ?></span>
                    <div class="text-right">
                        <strong class="block text-sm font-black text-glow-400"><?= e($service["price"]) ?></strong>
                        <span class="mt-1 block text-xs font-bold text-midnight-400">Prazo: <?= e($service["deadline"]) ?></span>
                    </div>
                </div>

                <h3 class="mt-4 m-0 text-2xl font-black text-white"><?= e($service["name"]) ?></h3>
                <p class="mt-3 leading-relaxed text-midnight-300"><?= e($service["description"]) ?></p>

                <div class="mt-4 rounded-[10px] border border-glow-400/35 bg-glow-400/10 p-3">
                    <strong class="text-sm font-black text-glow-400">Resultado que o cliente terá</strong>
                    <p class="mt-2 text-sm leading-relaxed text-white/85"><?= e($service["result"]) ?></p>
                </div>

                <ul class="mt-4 grid gap-2 text-midnight-300">
                    <?php foreach ($service["items"] as $item): ?>
                        <li class="rounded-[10px] border border-white/10 bg-midnight-950/60 px-3 py-2"><?= e(
                            $item,
                        ) ?></li>
                    <?php endforeach; ?>
                </ul>

                <a class="mt-5 inline-flex min-h-[48px] w-fit items-center justify-center gap-2 rounded-[10px] border border-ember-500/45 bg-ember-500/15 px-[18px] font-black leading-none text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-glow-400 hover:bg-ember-500/25" href="<?= e(url($service["portfolio"])) ?>">Ver projeto real</a>

                <blockquote class="mt-4 rounded-[10px] border border-glow-400/35 bg-glow-400/10 p-3 text-sm font-semibold leading-relaxed text-glow-100">
                    “<?= e($service["testimonial"]) ?>”
                </blockquote>

                <div class="mt-auto grid gap-3 pt-4 sm:grid-cols-2">
                    <a class="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-ember-500 bg-ember-600/75 px-[18px] font-black leading-none text-white transition-all duration-300 hover:bg-ember-500 hover:shadow-[0_0_18px_rgba(249,115,22,0.32)]" href="<?= url('orcamento.php?service=' . urlencode($service['name'])) ?>">Solicitar orçamento</a>
                    <a class="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white transition-all duration-300 hover:border-glow-400 hover:bg-white/10" href="<?= e(url($service["portfolio"])) ?>">Ver exemplo</a>
                </div>
            </article>
        <?php endforeach; ?>
    </div>
</section>

<section class="mt-14 rounded-2xl border border-glow-400/40 bg-glow-400/10 p-6 backdrop-blur-lg">
    <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">portfólio e prova social</p>
    <h2 class="m-0 text-2xl font-black text-glow-400">Cada serviço mostra resultado, projeto real e depoimento.</h2>
    <p class="mt-3 max-w-[56rem] leading-relaxed text-midnight-300">A ideia é o cliente entender o que recebe, ver um exemplo publicado e conferir uma prova social antes de pedir orçamento.</p>
</section>

<?php include __DIR__ . "/includes/footer.php"; ?>
