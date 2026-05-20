<?php
require_once __DIR__ . '/config/helpers.php';
if (current_user()) {
    redirect(redirect_after_login_path());
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';
    $stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        unset($_SESSION['user_cache']);
        flash('success', 'Login realizado com sucesso.');
        $target = redirect_after_login_path();
        redirect($user['role'] === 'admin' && $target === 'profile.php' ? 'admin/dashboard.php' : $target);
    }
    flash('error', 'E-mail ou senha invalidos.');
}
include __DIR__ . '/includes/header.php';
?>
<section class="flex min-h-[calc(100vh-220px)] items-center justify-center py-8">
    <form class="w-full max-w-[460px] glass rounded-2xl p-6 grid gap-3.5" method="post">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">acesso</p>
        <h1 class="m-0 text-[clamp(2rem,5vw,2.8rem)] font-black leading-tight tracking-tight gradient-text">Entrar</h1>
        <p class="mb-5 text-text-muted">Acesse sua conta para acompanhar pedidos e finalizar compras digitais.</p>
        <input type="email" name="email" placeholder="E-mail" required class="input-field min-h-[44px]">
        <input type="password" name="password" placeholder="Senha" required class="input-field min-h-[44px]">
        <button class="btn-primary w-full min-h-[44px] justify-center" type="submit">Entrar</button>
        <div class="flex items-center gap-3 text-[0.85rem] font-black text-text-muted before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10"><span>ou</span></div>
        <a class="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-amber-accent hover:shadow-[0_0_15px_rgba(200,135,58,0.2)]" href="<?= url('google-login.php') ?>">Entrar com Google</a>
        <a class="justify-self-center text-text-muted text-center transition-all duration-300 hover:text-amber-glow" href="<?= url('register.php') ?>">Criar uma conta</a>
    </form>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
