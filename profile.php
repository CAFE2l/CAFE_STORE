<?php
require_once __DIR__ . '/config/helpers.php';
require_login();

$user = current_user();
$uploadError = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        flash('error', 'Sessão expirada. Tente novamente.');
        redirect('profile.php');
    }

    $action = (string) ($_POST['action'] ?? 'profile');

    if ($action === 'redeem_coupon') {
        $code = strtoupper(trim((string) ($_POST['coupon_code'] ?? '')));
        if ($code === '') {
            flash('error', 'Informe o código do cupom.');
            redirect('profile.php');
        }

        $stmt = db()->prepare("SELECT * FROM coupons WHERE code = ? AND status = 'active' AND (starts_at IS NULL OR starts_at <= NOW()) AND (expires_at IS NULL OR expires_at >= NOW()) LIMIT 1");
        $stmt->execute([$code]);
        $coupon = $stmt->fetch();

        if (!$coupon) {
            flash('error', 'Cupom inválido ou inativo.');
            redirect('profile.php');
        }

        try {
            $insert = db()->prepare("INSERT INTO user_coupons (user_id, coupon_id, status) VALUES (?, ?, 'active')");
            $insert->execute([(int) $user['id'], (int) $coupon['id']]);
            flash('success', 'Cupom resgatado com sucesso.');
        } catch (PDOException $e) {
            flash('error', 'Você já resgatou esse cupom.');
        }
        redirect('profile.php');
    }

    if ($action === 'password') {
        $currentPassword = (string) ($_POST['current_password'] ?? '');
        $newPassword = (string) ($_POST['new_password'] ?? '');
        $confirmPassword = (string) ($_POST['confirm_password'] ?? '');

        if (mb_strlen($newPassword) < 8) {
            flash('error', 'A nova senha precisa ter pelo menos 8 caracteres.');
            redirect('profile.php#seguranca');
        }

        if ($newPassword !== $confirmPassword) {
            flash('error', 'A confirmação de senha não confere.');
            redirect('profile.php#seguranca');
        }

        $passwordStmt = db()->prepare('SELECT password_hash, auth_provider, password_updated_at FROM users WHERE id = ? LIMIT 1');
        $passwordStmt->execute([(int) $user['id']]);
        $passwordUser = $passwordStmt->fetch();
        $needsCurrentPassword = ($passwordUser['auth_provider'] ?? 'password') !== 'google' || !empty($passwordUser['password_updated_at']);

        if ($needsCurrentPassword && !password_verify($currentPassword, (string) ($passwordUser['password_hash'] ?? ''))) {
            flash('error', 'Senha atual inválida.');
            redirect('profile.php#seguranca');
        }

        $stmt = db()->prepare("UPDATE users SET password_hash = ?, auth_provider = 'password', password_updated_at = NOW() WHERE id = ?");
        $stmt->execute([password_hash($newPassword, PASSWORD_DEFAULT), (int) $user['id']]);

        unset($_SESSION['user_cache']);
        flash('success', 'Senha atualizada com segurança.');
        redirect('profile.php#seguranca');
    }

    if ($action === 'address') {
        $recipient = trim((string) ($_POST['recipient_name'] ?? ''));
        $phone = trim((string) ($_POST['phone'] ?? ''));
        $postalCode = trim((string) ($_POST['postal_code'] ?? ''));
        $addressLine = trim((string) ($_POST['address_line'] ?? ''));
        $city = trim((string) ($_POST['city'] ?? ''));
        $state = trim((string) ($_POST['state'] ?? ''));
        $country = trim((string) ($_POST['country'] ?? 'Brasil')) ?: 'Brasil';

        if ($addressLine === '') {
            flash('error', 'Informe o endereço para entrega.');
            redirect('profile.php#entrega');
        }

        $addressIdStmt = db()->prepare("SELECT id FROM addresses WHERE user_id = ? ORDER BY id LIMIT 1");
        $addressIdStmt->execute([(int) $user['id']]);
        $addressId = $addressIdStmt->fetchColumn();

        if ($addressId) {
            $addressStmt = db()->prepare('UPDATE addresses SET label = ?, recipient_name = ?, phone = ?, address_line = ?, city = ?, state = ?, postal_code = ?, country = ? WHERE id = ? AND user_id = ?');
            $addressStmt->execute(['Entrega principal', $recipient, $phone, $addressLine, $city, $state, $postalCode, $country, (int) $addressId, (int) $user['id']]);
        } else {
            $addressStmt = db()->prepare('INSERT INTO addresses (user_id, label, recipient_name, phone, address_line, city, state, postal_code, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $addressStmt->execute([(int) $user['id'], 'Entrega principal', $recipient, $phone, $addressLine, $city, $state, $postalCode, $country]);
        }

        flash('success', 'Endereço atualizado com sucesso.');
        redirect('profile.php#entrega');
    }

    $name = trim((string) ($_POST['name'] ?? ''));
    $bio = mb_substr(trim((string) ($_POST['bio'] ?? '')), 0, 500);
    $avatarUrl = $user['avatar_url'] ?? null;

    if ($name === '' || mb_strlen($name) < 2) {
        flash('error', 'Informe um nome válido.');
        redirect('profile.php');
    }

    if (!empty($_FILES['avatar']['name'])) {
        $file = $_FILES['avatar'];
        $allowedTypes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $uploadError = 'Não foi possível enviar a imagem.';
        } elseif (($file['size'] ?? 0) > 2 * 1024 * 1024) {
            $uploadError = 'A imagem precisa ter até 2MB.';
        } else {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($file['tmp_name']);

            if (!isset($allowedTypes[$mime])) {
                $uploadError = 'Use uma imagem JPG, PNG ou WebP.';
            } else {
                $uploadDir = __DIR__ . '/assets/uploads/avatars';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                if (!is_writable($uploadDir)) {
                    @chmod($uploadDir, 0777);
                }

                $filename = 'user-' . (int) $user['id'] . '-' . bin2hex(random_bytes(6)) . '.' . $allowedTypes[$mime];
                $target = $uploadDir . '/' . $filename;

                if (!is_writable($uploadDir)) {
                    $uploadError = 'A pasta de avatars não tem permissão de escrita.';
                } elseif (@move_uploaded_file($file['tmp_name'], $target)) {
                    $avatarUrl = 'assets/uploads/avatars/' . $filename;
                } else {
                    $uploadError = 'Falha ao salvar a imagem enviada.';
                }
            }
        }
    }

    if ($uploadError !== '') {
        flash('error', $uploadError);
        redirect('profile.php');
    }

    $stmt = db()->prepare('UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?');
    $stmt->execute([$name, $bio, $avatarUrl, (int) $user['id']]);

    unset($_SESSION['user_cache']);
    flash('success', 'Perfil atualizado com sucesso.');
    redirect('profile.php');
}

$user = current_user();

$ordersStmt = db()->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
$ordersStmt->execute([(int) $user['id']]);
$orders = $ordersStmt->fetchAll();

$metricsStmt = db()->prepare("SELECT COUNT(*) AS total_orders, COALESCE(SUM(CASE WHEN total_amount > 0 THEN total_amount ELSE total END), 0) AS total_spent FROM orders WHERE user_id = ?");
$metricsStmt->execute([(int) $user['id']]);
$profileMetrics = $metricsStmt->fetch() ?: ['total_orders' => 0, 'total_spent' => 0];

$addressStmt = db()->prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY id LIMIT 1');
$addressStmt->execute([(int) $user['id']]);
$address = $addressStmt->fetch() ?: [];

$reviewStmt = db()->prepare("
    SELECT r.*, p.name AS product_name, p.slug AS product_slug
    FROM product_reviews r
    JOIN products p ON p.id = r.product_id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
");
$reviewStmt->execute([(int) $user['id']]);
$myReviews = $reviewStmt->fetchAll();

$couponStmt = db()->prepare("
    SELECT uc.*, c.code, c.title, c.description, c.discount_type, c.discount_value
    FROM user_coupons uc
    JOIN coupons c ON c.id = uc.coupon_id
    WHERE uc.user_id = ? AND uc.status = 'active' AND c.status = 'active' AND (c.expires_at IS NULL OR c.expires_at >= NOW())
    ORDER BY uc.redeemed_at DESC
");
$couponStmt->execute([(int) $user['id']]);
$activeCoupons = $couponStmt->fetchAll();
$totalActiveCoupons = (int) db()->query("SELECT COUNT(*) FROM coupons WHERE status = 'active' AND (expires_at IS NULL OR expires_at >= NOW())")->fetchColumn();

$wishlistStmt = db()->prepare("
    SELECT p.*, f.created_at AS favorited_at
    FROM favorites f
    JOIN products p ON p.id = f.product_id
    WHERE f.user_id = ? AND p.status = 'active'
    ORDER BY f.created_at DESC
");
$wishlistStmt->execute([(int) $user['id']]);
$wishlist = $wishlistStmt->fetchAll();

$recommendedStmt = db()->prepare("
    SELECT p.*
    FROM products p
    WHERE p.status = 'active'
      AND p.id NOT IN (SELECT product_id FROM favorites WHERE user_id = ?)
    ORDER BY p.created_at DESC
    LIMIT 4
");
$recommendedStmt->execute([(int) $user['id']]);
$recommended = $recommendedStmt->fetchAll();

$isClient = user_has_client_history((int) $user['id']);
$isOnline = user_is_online($user);
$avatar = product_image($user['avatar_url'] ?: 'assets/images/mascote.png');
$whatsappMessage = "Olá, sou {$user['name']} ({$user['email']}). Quero falar sobre um orçamento para meu negócio.";
$whatsappLink = whatsapp_url($whatsappMessage);
$accountCreatedAt = !empty($user['created_at']) ? date('d/m/Y', strtotime((string) $user['created_at'])) : 'Data indisponível';
$passwordUpdatedAt = ($user['password_updated_at'] ?? null) ?: ($user['created_at'] ?? null);
$passwordUpdatedLabel = (($user['auth_provider'] ?? 'password') === 'google' && empty($user['password_updated_at'] ?? null))
    ? 'Login por Google'
    : relative_days_label($passwordUpdatedAt);

include __DIR__ . '/includes/header.php';
?>
<div class="mb-6 flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
    <div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">minha conta</p>
        <h1 class="m-0 text-[clamp(2rem,4vw,3.4rem)] font-black leading-tight tracking-tight">Olá, <span class="gradient-text"><?= e($user['name']) ?></span></h1>
    </div>
    <a class="btn-primary min-h-[44px]" href="<?= url('products.php') ?>">Ver produtos</a>
</div>

<div class="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
    <section class="glass rounded-2xl p-6">
        <div class="flex flex-wrap items-center gap-4">
            <div class="relative h-28 w-28 overflow-hidden rounded-2xl border border-white/10 bg-background">
                <img src="<?= e($avatar) ?>" alt="<?= e($user['name']) ?>" class="h-full w-full object-cover">
                <span class="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-background <?= $isOnline ? 'bg-green-500' : 'bg-red-500' ?>"></span>
            </div>
            <div>
                <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">perfil</p>
                <h2 class="m-0 text-2xl font-black text-text-primary"><?= e($user['name']) ?></h2>
                <p class="mt-1 text-text-muted"><?= e($user['email']) ?></p>
                <span class="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-sm font-black <?= $isOnline ? 'text-green-300' : 'text-red-300' ?>">
                    <span class="h-2.5 w-2.5 rounded-full <?= $isOnline ? 'bg-green-500' : 'bg-red-500' ?>"></span>
                    <?= $isOnline ? 'Online agora' : 'Offline' ?>
                </span>
            </div>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <div class="rounded-[10px] border border-white/10 bg-background/60 p-4">
                <span class="text-sm text-text-muted">Pedidos</span>
                <strong class="mt-2 block text-2xl font-black text-amber-glow"><?= (int) $profileMetrics['total_orders'] ?></strong>
            </div>
            <div class="rounded-[10px] border border-white/10 bg-background/60 p-4">
                <span class="text-sm text-text-muted">Cupons para usar</span>
                <strong class="mt-2 block text-2xl font-black text-amber-glow"><?= count($activeCoupons) ?></strong>
            </div>
            <div class="rounded-[10px] border border-white/10 bg-background/60 p-4">
                <span class="text-sm text-text-muted">Conta criada</span>
                <strong class="mt-2 block text-base font-black text-amber-glow"><?= e($accountCreatedAt) ?></strong>
            </div>
            <div class="rounded-[10px] border border-white/10 bg-background/60 p-4">
                <span class="text-sm text-text-muted">Senha</span>
                <strong class="mt-2 block text-base font-black text-amber-glow"><?= e($passwordUpdatedLabel) ?></strong>
            </div>
        </div>

        <div class="mt-6 rounded-[10px] border border-white/10 bg-background/60 p-4">
            <p class="mb-2 text-sm font-black text-amber-glow">Bio</p>
            <p class="m-0 leading-relaxed text-text-secondary"><?= e($user['bio'] ?: 'Adicione uma bio para contar um pouco sobre você ou seu negócio.') ?></p>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <a class="btn-primary min-h-[44px] justify-center" href="<?= url('orcamento.php') ?>">Pedir orçamento</a>
            <?php if ($isClient): ?>
                <a class="btn-ghost min-h-[44px] justify-center" href="<?= e(TELEGRAM_CLIENT_CHANNEL_URL) ?>" target="_blank" rel="noopener">Canal de clientes</a>
            <?php else: ?>
                <a class="btn-ghost min-h-[44px] justify-center" href="<?= e($whatsappLink) ?>" target="_blank" rel="noopener">Falar no WhatsApp</a>
            <?php endif; ?>
        </div>
    </section>

    <section class="glass rounded-2xl p-6">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">configurações</p>
        <h2 class="m-0 mb-4 text-2xl font-black text-text-primary">Perfil público</h2>
        <form class="grid gap-4" method="post" enctype="multipart/form-data">
            <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
            <input type="hidden" name="action" value="profile">
            <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                <span>Nome</span>
                <input name="name" value="<?= e($user['name']) ?>" required class="input-field min-h-[44px]">
            </label>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                <span>Bio</span>
                <textarea name="bio" rows="4" maxlength="500" placeholder="Conte sobre seu negócio, área, objetivos ou preferências de atendimento." class="input-field min-h-[116px]"><?= e($user['bio'] ?? '') ?></textarea>
            </label>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                <span>Foto de perfil</span>
                <input type="file" name="avatar" accept="image/png,image/jpeg,image/webp" class="w-full rounded-[10px] border border-white/10 bg-background/80 p-2.5 text-white outline-none file:mr-4 file:rounded-[8px] file:border-0 file:bg-amber-accent file:px-3 file:py-2 file:font-black file:text-background">
            </label>
            <button class="btn-primary w-fit min-h-[44px]" type="submit">Salvar perfil</button>
        </form>
    </section>
</div>

<div class="mt-5 grid gap-5 lg:grid-cols-2">
    <section id="entrega" class="glass rounded-2xl p-6">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">entrega</p>
        <h2 class="m-0 mb-4 text-2xl font-black text-text-primary">Endereço de entrega</h2>
        <form class="grid gap-4" method="post">
            <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
            <input type="hidden" name="action" value="address">
            <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                <span>Telefone</span>
                <input name="phone" value="<?= e($address['phone'] ?? '') ?>" placeholder="+55 (41) 99999-9999" class="input-field min-h-[44px]">
            </label>
            <div class="grid gap-4 md:grid-cols-[1fr_160px]">
                <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                    <span>Endereço</span>
                    <input name="address_line" value="<?= e($address['address_line'] ?? '') ?>" placeholder="Rua, número, complemento" class="input-field min-h-[44px]">
                </label>
                <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                    <span>CEP</span>
                    <input name="postal_code" value="<?= e($address['postal_code'] ?? '') ?>" placeholder="00000-000" class="input-field min-h-[44px]">
                </label>
            </div>
            <div class="grid gap-4 md:grid-cols-4">
                <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted md:col-span-2">
                    <span>Nome de recebimento</span>
                    <input name="recipient_name" value="<?= e($address['recipient_name'] ?? $user['name']) ?>" class="input-field min-h-[44px]">
                </label>
                <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                    <span>Cidade</span>
                    <input name="city" value="<?= e($address['city'] ?? '') ?>" class="input-field min-h-[44px]">
                </label>
                <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                    <span>Estado</span>
                    <input name="state" value="<?= e($address['state'] ?? '') ?>" class="input-field min-h-[44px]">
                </label>
            </div>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                <span>País</span>
                <input name="country" value="<?= e($address['country'] ?? 'Brasil') ?>" class="input-field min-h-[44px]">
            </label>
            <button class="btn-primary w-fit min-h-[44px]" type="submit">Salvar entrega</button>
        </form>
    </section>

    <section id="seguranca" class="glass rounded-2xl p-6">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">segurança</p>
        <h2 class="m-0 mb-4 text-2xl font-black text-text-primary">Alterar senha</h2>
        <form class="grid gap-4" method="post">
            <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
            <input type="hidden" name="action" value="password">
            <?php if (($user['auth_provider'] ?? 'password') !== 'google' || !empty($user['password_updated_at'] ?? null)): ?>
                <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                    <span>Senha atual</span>
                    <input type="password" name="current_password" autocomplete="current-password" class="input-field min-h-[44px]">
                </label>
            <?php endif; ?>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                <span>Nova senha</span>
                <input type="password" name="new_password" minlength="8" autocomplete="new-password" required class="input-field min-h-[44px]">
            </label>
            <label class="grid gap-1.5 text-[0.9rem] font-black text-text-muted">
                <span>Confirmar nova senha</span>
                <input type="password" name="confirm_password" minlength="8" autocomplete="new-password" required class="input-field min-h-[44px]">
            </label>
            <button class="btn-primary w-fit min-h-[44px]" type="submit">Salvar senha</button>
        </form>
    </section>
</div>

<div class="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
    <section class="glass rounded-2xl p-6">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">cupons</p>
        <h2 class="m-0 text-2xl font-black text-text-primary">Cupons para usar <?= count($activeCoupons) ?></h2>
        <p class="mt-2 text-sm text-text-muted">Você resgatou <?= count($activeCoupons) ?> de <?= $totalActiveCoupons ?> cupons ativos do site.</p>
        <form class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]" method="post">
            <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
            <input type="hidden" name="action" value="redeem_coupon">
            <input name="coupon_code" placeholder="Código do cupom" class="input-field min-h-[44px]">
            <button class="btn-primary min-h-[44px] px-[18px]" type="submit">Resgatar</button>
        </form>
        <div class="mt-4 grid gap-3">
            <?php foreach ($activeCoupons as $coupon): ?>
                <div class="rounded-[10px] border border-white/10 bg-background/60 p-4">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <strong class="text-amber-glow"><?= e($coupon['code']) ?></strong>
                        <span class="badge-amber"><?= $coupon['discount_type'] === 'percent' ? (int) $coupon['discount_value'] . '%' : money((float) $coupon['discount_value']) ?></span>
                    </div>
                    <p class="mt-2 font-bold text-text-primary"><?= e($coupon['title']) ?></p>
                    <p class="mt-1 text-sm text-text-muted"><?= e($coupon['description'] ?? '') ?></p>
                </div>
            <?php endforeach; ?>
            <?php if (!$activeCoupons): ?><p class="text-text-muted">Nenhum cupom ativo resgatado ainda.</p><?php endif; ?>
        </div>
    </section>

    <section class="glass rounded-2xl p-6">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">avaliações feitas</p>
        <h2 class="m-0 mb-4 text-2xl font-black text-text-primary">Suas avaliações</h2>
        <div class="grid gap-3">
            <?php foreach ($myReviews as $review): ?>
                <a class="rounded-[10px] border border-white/10 bg-background/60 p-4 transition-all hover:border-amber-accent" href="<?= url('product.php?slug=' . urlencode($review['product_slug'])) ?>">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <strong class="text-text-primary"><?= e($review['product_name']) ?></strong>
                        <span class="text-amber-glow"><?= str_repeat('★', (int) $review['rating']) ?></span>
                    </div>
                    <p class="mt-2 text-sm text-text-muted"><?= e(excerpt($review['comment'] ?: 'Sem comentário.', 140)) ?></p>
                    <span class="badge-muted mt-2"><?= e($review['status']) ?></span>
                </a>
            <?php endforeach; ?>
            <?php if (!$myReviews): ?><p class="text-text-muted">Você ainda não fez avaliações.</p><?php endif; ?>
        </div>
    </section>
</div>

<div class="mt-5 grid gap-5 lg:grid-cols-2">
    <section class="glass rounded-2xl p-6">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">lista de desejo</p>
        <h2 class="m-0 mb-4 text-2xl font-black text-text-primary">Produtos salvos</h2>
        <div class="grid gap-3">
            <?php foreach ($wishlist as $item): ?>
                <div class="grid items-center gap-3 rounded-[10px] border border-white/10 bg-background/60 p-3 sm:grid-cols-[64px_1fr_auto]">
                    <img src="<?= e(product_main_image($item)) ?>" alt="<?= e($item['name']) ?>" class="h-16 w-16 rounded-[8px] object-cover">
                    <div>
                        <strong class="text-text-primary"><?= e($item['name']) ?></strong>
                        <p class="mt-1 text-sm text-text-muted"><?= money((float) $item['price']) ?></p>
                    </div>
                    <a class="btn-ghost min-h-[38px] px-3 text-sm" href="<?= url('product.php?slug=' . urlencode($item['slug'])) ?>">Ver</a>
                </div>
            <?php endforeach; ?>
            <?php if (!$wishlist): ?><p class="text-text-muted">Sua lista de desejo ainda está vazia.</p><?php endif; ?>
        </div>
    </section>

    <section class="glass rounded-2xl p-6">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">recomendados</p>
        <h2 class="m-0 mb-4 text-2xl font-black text-text-primary">Para você</h2>
        <div class="grid gap-3">
            <?php foreach ($recommended as $item): ?>
                <div class="grid items-center gap-3 rounded-[10px] border border-white/10 bg-background/60 p-3 sm:grid-cols-[64px_1fr_auto]">
                    <img src="<?= e(product_main_image($item)) ?>" alt="<?= e($item['name']) ?>" class="h-16 w-16 rounded-[8px] object-cover">
                    <div>
                        <strong class="text-text-primary"><?= e($item['name']) ?></strong>
                        <p class="mt-1 text-sm text-text-muted"><?= e(product_type_label($item['type'])) ?> • <?= money((float) $item['price']) ?></p>
                    </div>
                    <a class="btn-ghost min-h-[38px] px-3 text-sm" href="<?= url('product.php?slug=' . urlencode($item['slug'])) ?>">Ver</a>
                </div>
            <?php endforeach; ?>
            <?php if (!$recommended): ?><p class="text-text-muted">Sem recomendações novas no momento.</p><?php endif; ?>
        </div>
    </section>
</div>

<section class="mt-5 glass rounded-2xl p-6">
    <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">histórico</p>
    <h2 class="m-0 mb-4 text-2xl font-black text-text-primary">Pedidos</h2>
    <div class="grid gap-3">
        <?php foreach ($orders as $order): ?>
            <div class="grid items-center gap-3.5 rounded-[10px] border border-white/10 bg-background/60 p-3.5 md:grid-cols-[1fr_auto_auto]">
                <span class="text-text-primary">#<?= (int) $order['id'] ?> <small class="mt-1 block text-text-muted font-semibold"><?= e($order['status']) ?> / <?= e($order['payment_status']) ?></small></span>
                <span class="text-sm text-text-muted"><?= date('d/m/Y', strtotime((string) $order['created_at'])) ?></span>
                <strong class="text-amber-glow"><?= money((float) ($order['total_amount'] ?? $order['total'])) ?></strong>
            </div>
        <?php endforeach; ?>
    </div>
    <?php if (!$orders): ?><p class="text-text-muted">Você ainda não fez pedidos.</p><?php endif; ?>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
