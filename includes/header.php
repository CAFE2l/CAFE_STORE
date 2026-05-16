<?php
require_once __DIR__ . '/../config/helpers.php';
$user = current_user();
?>
<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e(APP_NAME) ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        cafeBlack: '#050505',
                        cafeRed: '#FF3C38',
                        cafeOrange: '#FF7A00',
                        cafeYellow: '#FFD000'
                    }
                }
            }
        }
    </script>
    <link rel="stylesheet" href="<?= url('assets/css/style.css') ?>">
</head>
<body class="bg-cafeBlack text-white antialiased">
<header class="site-header">
    <div class="header-inner">
        <a class="brand" href="<?= url('index.php') ?>" aria-label="CAFÉ STORE">
            <img src="<?= url('assets/images/mascot.svg') ?>" alt="Mascote CAFÉ">
            <span class="gradient-text">CAFÉ STORE</span>
        </a>
        <button class="mobile-toggle" type="button" data-nav-toggle aria-label="Abrir menu" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
        <nav class="main-nav" data-main-nav>
            <a href="<?= url('index.php') ?>">Início</a>
            <a href="<?= url('products.php') ?>">Produtos</a>
            <a href="<?= url('cart.php') ?>">Carrinho <span class="badge"><?= cart_count() ?></span></a>
            <?php if ($user): ?>
                <a href="<?= url('profile.php') ?>">Perfil</a>
                <?php if ($user['role'] === 'admin'): ?><a class="nav-cta" href="<?= url('admin/dashboard.php') ?>">Admin</a><?php endif; ?>
                <a href="<?= url('logout.php') ?>">Sair</a>
            <?php else: ?>
                <a class="nav-cta" href="<?= url('login.php') ?>">Entrar</a>
            <?php endif; ?>
        </nav>
    </div>
</header>
<main class="page">
<?php include __DIR__ . '/flash.php'; ?>
