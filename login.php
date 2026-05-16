<?php
require_once __DIR__ . '/config/helpers.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';
    $stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        flash('success', 'Login realizado com sucesso.');
        redirect($user['role'] === 'admin' ? 'admin/dashboard.php' : 'profile.php');
    }
    flash('error', 'E-mail ou senha inválidos.');
}
include __DIR__ . '/includes/header.php';
?>
<section class="auth-shell">
    <form class="auth-card" method="post">
        <p class="eyebrow">acesso</p>
        <h1>Entrar</h1>
        <p class="muted mb-5">Acesse sua conta para acompanhar pedidos e finalizar compras digitais.</p>
        <input type="email" name="email" placeholder="E-mail" required>
        <input type="password" name="password" placeholder="Senha" required>
        <button class="btn primary full" type="submit">Entrar</button>
        <div class="auth-divider"><span>ou</span></div>
        <a class="btn ghost full" href="<?= url('google-login.php') ?>">Entrar com Google</a>
        <a class="muted text-center" href="<?= url('register.php') ?>">Criar uma conta</a>
    </form>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
