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
    <form class="w-full max-w-[460px] rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg grid gap-3.5" method="post">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-glow-400">acesso</p>
        <h1 class="m-0 text-[clamp(2rem,5vw,2.8rem)] font-black leading-tight tracking-tight bg-gradient-to-r from-ember-500 to-glow-400 bg-clip-text text-transparent">Entrar</h1>
        <p class="mb-5 text-midnight-400">Acesse sua conta para acompanhar pedidos e finalizar compras digitais.</p>
        <input type="email" name="email" placeholder="E-mail" required class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.12),0_0_15px_rgba(255,215,0,0.1)]">
        <input type="password" name="password" placeholder="Senha" required class="w-full min-h-[44px] rounded-[10px] border border-white/10 bg-midnight-950/80 p-2.5 text-white outline-none backdrop-blur transition-all duration-300 focus:border-glow-400 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.12),0_0_15px_rgba(255,215,0,0.1)]">
        <button class="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-glow-400 bg-gradient-to-r from-ember-500 to-glow-400 bg-[length:200%_100%] bg-[0%_0%] px-[18px] font-black leading-none text-midnight-950 shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all duration-300 hover:bg-[100%_0] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,0,0.6),0_0_40px_rgba(255,107,0,0.3)]" type="submit">Entrar</button>
        <div class="flex items-center gap-3 text-[0.85rem] font-black text-midnight-400 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10"><span>ou</span></div>
        <a class="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-glow-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]" href="<?= url('google-login.php') ?>">Entrar com Google</a>
        <a class="justify-self-center text-midnight-400 text-center transition-all duration-300 hover:text-glow-400" href="<?= url('register.php') ?>">Criar uma conta</a>
    </form>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
