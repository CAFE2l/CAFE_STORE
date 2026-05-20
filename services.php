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
        <p class="mb-4 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">agência digital</p>
        <h1 class="m-0 max-w-[660px] text-[clamp(2.55rem,4.8vw,4.35rem)] font-black leading-[1.08]">
            <span class="block text-text-primary">Soluções digitais</span>
            <span class="mt-3 block text-amber-glow">CAFÉ STORE</span>
        </h1>
        <p class="mt-7 max-w-[40rem] text-[clamp(1rem,1.5vw,1.16rem)] leading-relaxed text-text-muted">Eu faço sites, landing pages, vídeos curtos, vídeos longos e web aplicações para o seu negócio. Cada produto digital tem escopo, prazo e entrega definidos antes do início.</p>
        <div class="mt-8 flex flex-wrap gap-3">
            <a class="btn-primary" href="#serviços">Ver soluções</a>
            <a class="btn-ghost min-h-[44px]" href="<?= url(
                "products.php",
            ) ?>">Ver produtos</a>
        </div>
    </div>
    <div class="glass p-6">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">como funciona</p>
        <div class="grid gap-4">
            <div class="rounded-[10px] border border-white/10 bg-background/60 p-4">
                <strong class="text-amber-glow">1. Briefing</strong>
                <p class="mt-2 text-text-muted">Você explica seu objetivo, público, prazo e o que o negócio precisa resolver.</p>
            </div>
            <div class="rounded-[10px] border border-white/10 bg-background/60 p-4">
                <strong class="text-amber-glow">2. Orçamento</strong>
                <p class="mt-2 text-text-muted">O valor é definido pelo produto escolhido e pelo escopo real da entrega.</p>
            </div>
            <div class="rounded-[10px] border border-white/10 bg-background/60 p-4">
                <strong class="text-amber-glow">3. Entrega online</strong>
                <p class="mt-2 text-text-muted">O projeto é entregue digitalmente, com revisão e orientação de uso conforme combinado.</p>
            </div>
        </div>
    </div>
</section>

<section id="serviços" class="mt-4">
    <div class="mb-6 flex items-end justify-between gap-6">
        <div>
            <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">catálogo de produtos digitais</p>
            <h2 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight text-amber-glow">O que posso fazer pelo seu negócio</h2>
        </div>
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
        <?php foreach ($services as $service): ?>
            <article class="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl shadow-[0_18px_48px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-secondary/40 hover:shadow-[0_24px_58px_rgba(0,0,0,0.36),0_0_26px_rgba(200,135,58,0.12)]">
                <div class="overflow-hidden rounded-[14px] border border-white/10 bg-background">
                    <img src="<?= e(url($service["image"])) ?>" alt="Resultado de <?= e($service["name"]) ?>" class="aspect-[16/9] w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100">
                </div>

                <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <span class="inline-flex w-fit items-center justify-center rounded-full border border-amber-accent/30 bg-amber-accent/10 px-3 py-1 text-[0.76rem] font-black leading-none text-amber-glow"><?= e($service["tag"]) ?></span>
                    <div class="text-right">
                        <strong class="block text-sm font-black text-amber-glow"><?= e($service["price"]) ?></strong>
                        <span class="mt-1 block text-xs font-bold text-text-muted">Prazo: <?= e($service["deadline"]) ?></span>
                    </div>
                </div>

                <h3 class="mt-4 m-0 text-2xl font-black text-text-primary"><?= e($service["name"]) ?></h3>
                <p class="mt-3 leading-relaxed text-text-secondary"><?= e($service["description"]) ?></p>

                <div class="mt-4 rounded-[10px] border border-amber-accent/30 bg-amber-accent/10 p-3">
                    <strong class="text-sm font-black text-amber-glow">Resultado que o cliente terá</strong>
                    <p class="mt-2 text-sm leading-relaxed text-text-primary/85"><?= e($service["result"]) ?></p>
                </div>

                <ul class="mt-4 grid gap-2 text-text-secondary">
                    <?php foreach ($service["items"] as $item): ?>
                        <li class="rounded-[10px] border border-white/10 bg-background/50 px-3 py-2"><?= e(
                            $item,
                        ) ?></li>
                    <?php endforeach; ?>
                </ul>

                <a class="mt-5 inline-flex min-h-[48px] w-fit items-center justify-center gap-2 rounded-[10px] border border-amber-secondary/40 bg-amber-secondary/10 px-[18px] font-black leading-none text-text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-accent hover:bg-amber-secondary/20" href="<?= e(url($service["portfolio"])) ?>">Ver projeto real</a>

                <blockquote class="mt-4 rounded-[10px] border border-amber-accent/30 bg-amber-accent/10 p-3 text-sm font-semibold leading-relaxed text-amber-glow/90">
                    “<?= e($service["testimonial"]) ?>”
                </blockquote>

                <div class="mt-auto grid gap-3 pt-4 sm:grid-cols-2">
                    <a class="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-amber-secondary bg-amber-accent/70 px-[18px] font-black leading-none text-background transition-all duration-300 hover:bg-amber-accent hover:shadow-[0_0_18px_rgba(200,135,58,0.32)]" href="<?= url('orcamento.php?service=' . urlencode($service['name'])) ?>">Solicitar orçamento</a>
                    <a class="btn-ghost min-h-[44px]" href="<?= e(url($service["portfolio"])) ?>">Ver exemplo</a>
                </div>
            </article>
        <?php endforeach; ?>
    </div>
</section>

<section class="mt-14 rounded-2xl border border-amber-accent/30 bg-amber-accent/10 p-6 backdrop-blur-lg">
    <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">portfólio e prova social</p>
    <h2 class="m-0 text-2xl font-black text-amber-glow">Cada serviço mostra resultado, projeto real e depoimento.</h2>
    <p class="mt-3 max-w-[56rem] leading-relaxed text-text-secondary">A ideia é o cliente entender o que recebe, ver um exemplo publicado e conferir uma prova social antes de pedir orçamento.</p>
</section>

<?php include __DIR__ . "/includes/footer.php"; ?>
