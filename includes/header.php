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
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="icon" type="image/png" href="<?= url(
        "assets/images/icons/favicon.png",
    ) ?>">
    <link rel="shortcut icon" type="image/png" href="<?= url(
        "assets/images/icons/favicon.png",
    ) ?>">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        cafe: {
                            50: '#fdf2e9', 100: '#fadcc4', 200: '#f5c59e',
                            300: '#f0af78', 400: '#eb984e', 500: '#e67e22',
                            600: '#cf6a17', 700: '#b85a12', 800: '#a04a0e',
                            900: '#883a0a', 950: '#6a2c08',
                        },
                        fire: {
                            50: '#fff1f0', 100: '#ffd5d2', 200: '#ffa9a3',
                            300: '#ff7d74', 400: '#ff5146', 500: '#ff3c38',
                            600: '#e03530', 700: '#c02d28', 800: '#a02520',
                            900: '#801d18', 950: '#601510',
                        },
                        ember: {
                            50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
                            300: '#fdba74', 400: '#fb923c', 500: '#f97316',
                            600: '#ea580c', 700: '#c2410c', 800: '#9a3412',
                            900: '#7c2d12', 950: '#5c1e0a',
                        },
                        glow: {
                            50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a',
                            300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b',
                            600: '#d97706', 700: '#b45309', 800: '#92400e',
                            900: '#78350f', 950: '#542b0a',
                        },
                        midnight: {
                            50: '#f6f6f6', 100: '#e7e7e7', 200: '#d1d1d1',
                            300: '#b0b0b0', 400: '#888888', 500: '#6d6d6d',
                            600: '#5d5d5d', 700: '#4f4f4f', 800: '#383838',
                            900: '#1a1a1a', 950: '#0a0a0a',
                        },
                        cream: {
                            50: '#fefcf8', 100: '#fcf8f0', 200: '#f9f1e0',
                            300: '#f2e6cd', 400: '#e8d9b8', 500: '#dcc9a0',
                            600: '#c9b48a', 700: '#b09b72', 800: '#927d5a',
                            900: '#756246',
                        },
                    },
                    fontFamily: {
                        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
                    },
                    keyframes: {
                        fadeInUp: {
                            '0%': { opacity: '0', transform: 'translateY(28px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' },
                        },
                        float: {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-14px)' },
                        },
                        pulseGlow: {
                            '0%, 100%': { boxShadow: '0 0 18px rgba(255,107,0,.38), 0 0 36px rgba(255,107,0,.18)' },
                            '50%': { boxShadow: '0 0 30px rgba(255,107,0,.68), 0 0 58px rgba(255,215,0,.24)' },
                        },
                        shimmer: {
                            '0%': { backgroundPosition: '-180% 0' },
                            '100%': { backgroundPosition: '180% 0' },
                        },
                    },
                    animation: {
                        'fade-in-up': 'fadeInUp .72s cubic-bezier(.22,.61,.36,1) both',
                        float: 'float 4.5s ease-in-out infinite',
                        'pulse-glow': 'pulseGlow 2.6s ease-in-out infinite',
                        shimmer: 'shimmer 2.8s linear infinite',
                    },
                }
            }
        }
    </script>
    <link rel="stylesheet" href="<?= url("assets/css/style.css") ?>">
</head>
<body class="min-h-screen overflow-x-hidden bg-midnight-950 text-cream-50 antialiased selection:bg-glow-400 selection:text-midnight-950">
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
            <span class="text-xl font-black leading-none text-white">CAFÉ <span class="bg-gradient-to-r from-fire-500 via-ember-500 to-glow-400 bg-clip-text text-transparent">STORE</span></span>
        </a>
        <button class="ml-auto inline-flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-white backdrop-blur transition-all duration-300 hover:bg-white/10 md:hidden" type="button" data-nav-toggle aria-label="Abrir menu" aria-expanded="false">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="2" y1="5" x2="16" y2="5"/><line x1="2" y1="9" x2="16" y2="9"/><line x1="2" y1="13" x2="16" y2="13"/>
            </svg>
        </button>
        <nav class="hidden items-center justify-center gap-7 text-sm font-semibold text-midnight-300 md:flex" data-main-nav>
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
                <span class="ml-1.5 inline-flex min-w-[24px] items-center justify-center rounded-full border border-glow-400 bg-glow-400 px-[9px] py-[4px] text-[0.76rem] font-black leading-none text-midnight-950"><?= cart_count() ?></span>
            </a>
        </nav>
        <div class="hidden items-center justify-end gap-3 md:flex">
            <?php if ($user): ?>
                <a class="inline-flex min-h-[40px] items-center justify-center rounded-[10px] px-3 font-bold text-midnight-300 transition-all duration-300 hover:bg-white/5 hover:text-white" href="<?= url(
                    "profile.php",
                ) ?>">Perfil</a>
                <?php if ($user["role"] === "admin"): ?>
                    <a class="site-header-cta" href="<?= url(
                        "admin/dashboard.php",
                    ) ?>">Admin</a>
                <?php endif; ?>
                <a class="inline-flex min-h-[40px] items-center justify-center rounded-[10px] px-3 font-bold text-midnight-300 transition-all duration-300 hover:bg-white/5 hover:text-white" href="<?= url(
                    "logout.php",
                ) ?>">Sair</a>
            <?php else: ?>
                <a class="inline-flex min-h-[40px] items-center justify-center rounded-[10px] px-3 font-bold text-midnight-300 transition-all duration-300 hover:bg-white/5 hover:text-white" href="<?= url(
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
