<?php
require_once __DIR__ . "/../config/helpers.php";
$user = current_user();
?>
<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e(APP_NAME) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&family=Playfair+Display:wght@600;700;800;900&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="<?= url(
        "assets/images/icons/favicon.png",
    ) ?>">
    <link rel="shortcut icon" type="image/png" href="<?= url(
        "assets/images/icons/favicon.png",
    ) ?>">
    <link rel="stylesheet" href="<?= url("assets/css/app.build.css") ?>">
</head>
<body class="min-h-screen overflow-x-hidden bg-background text-text-primary antialiased selection:bg-amber-accent selection:text-background">
<header class="site-glass-header sticky top-0 z-40" data-site-header>
    <div class="mx-auto grid h-[72px] max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-6 px-4 md:px-6 lg:px-8">
        <a class="inline-flex items-center gap-2.5 font-black tracking-tight transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(255,107,0,0.8)]" href="<?= url(
            "index.php",
        ) ?>" aria-label="CAFÉ STORE">
            <span class="brand-logo h-9 w-9 shrink-0 overflow-hidden rounded-[10px]">
                <img src="<?= url(
                    "assets/images/icons/favicon.png",
                ) ?>" alt="CAFÉ STORE" width="36" height="36" class="h-9 w-9 object-contain">
            </span>
            <span class="font-display text-xl font-black leading-none text-text-primary">CAFÉ <span class="gradient-text">STORE</span></span>
        </a>
        <button class="ml-auto inline-flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-white backdrop-blur transition-all duration-300 hover:bg-white/10 md:hidden" type="button" data-nav-toggle aria-label="Abrir menu" aria-expanded="false">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="2" y1="5" x2="16" y2="5"/><line x1="2" y1="9" x2="16" y2="9"/><line x1="2" y1="13" x2="16" y2="13"/>
            </svg>
        </button>
        <nav class="hidden items-center justify-center gap-7 text-sm font-semibold text-text-secondary md:flex" data-main-nav>
            <a class="site-nav-link" href="<?= url(
                "index.php",
            ) ?>">Início</a>
            <a class="site-nav-link" href="<?= url(
                "services.php",
            ) ?>">Serviços</a>
            <a class="site-nav-link" href="<?= url(
                "products.php",
            ) ?>">Produtos</a>
            <a class="site-nav-link" href="<?= url(
                "feedbacks.php",
            ) ?>">Feedbacks</a>
            <a class="site-nav-link" href="<?= url(
                "cart.php",
            ) ?>">
                Carrinho
                <span class="badge-amber ml-1.5 min-w-[24px] px-[9px] py-[4px] text-[0.76rem]"><?= cart_count() ?></span>
            </a>
        </nav>
        <div class="hidden items-center justify-end gap-3 md:flex">
            <?php if ($user): ?>
                <a class="inline-flex min-h-[40px] items-center justify-center rounded-[10px] px-3 font-bold text-text-secondary transition-all duration-300 hover:bg-white/5 hover:text-text-primary" href="<?= url(
                    "profile.php",
                ) ?>">Perfil</a>
                <?php if ($user["role"] === "admin"): ?>
                    <a class="site-header-cta" href="<?= url(
                        "admin/dashboard.php",
                    ) ?>">Admin</a>
                <?php endif; ?>
                <a class="inline-flex min-h-[40px] items-center justify-center rounded-[10px] px-3 font-bold text-text-secondary transition-all duration-300 hover:bg-white/5 hover:text-text-primary" href="<?= url(
                    "logout.php",
                ) ?>">Sair</a>
            <?php else: ?>
                <a class="inline-flex min-h-[40px] items-center justify-center rounded-[10px] px-3 font-bold text-text-secondary transition-all duration-300 hover:bg-white/5 hover:text-text-primary" href="<?= url(
                    "login.php",
                ) ?>">Entrar</a>
                <a class="site-header-cta" href="<?= url(
                    "orcamento.php",
                ) ?>">Começar Agora</a>
            <?php endif; ?>
        </div>
    </div>
</header>
<main class="relative z-10 mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-10 lg:px-8">
<?php include __DIR__ . "/flash.php"; ?>
