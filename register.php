<?php
require_once __DIR__ . '/config/helpers.php';
if (current_user()) {
    redirect(redirect_after_login_path());
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';

    if (mb_strlen($name) < 2 || !$email || mb_strlen($password) < 6) {
        flash('error', 'Informe nome, e-mail valido e senha com pelo menos 6 caracteres.');
    } else {
        try {
            $stmt = db()->prepare('INSERT INTO users (name, email, password_hash, role, password_updated_at) VALUES (?, ?, ?, ?, NOW())');
            $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), 'customer']);
            $_SESSION['user_id'] = (int) db()->lastInsertId();
            unset($_SESSION['user_cache']);
            flash('success', 'Conta criada. Bem-vindo a CAFÉ STORE.');
            redirect(redirect_after_login_path());
        } catch (PDOException $e) {
            flash('error', 'Este e-mail já está cadastrado.');
        }
    }
}
include __DIR__ . '/includes/header.php';
?>
<section class="flex min-h-[calc(100vh-220px)] items-center justify-center py-8">
    <form class="w-full max-w-[460px] glass rounded-2xl p-6 grid gap-3.5" method="post">
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">cadastro</p>
        <h1 class="m-0 text-[clamp(2rem,5vw,2.8rem)] font-black leading-tight tracking-tight gradient-text">Criar conta</h1>
        <p class="mb-5 text-text-muted">Entre para salvar pedidos, solicitar orçamentos e acompanhar soluções digitais com rapidez.</p>
        <input name="name" placeholder="Nome" required class="input-field min-h-[44px]">
        <input type="email" name="email" placeholder="E-mail" required class="input-field min-h-[44px]">
        <input type="password" name="password" placeholder="Senha" minlength="6" required class="input-field min-h-[44px]">
        <button class="btn-primary w-full min-h-[44px] justify-center" type="submit">Cadastrar</button>
        <div class="flex items-center gap-3 text-[0.85rem] font-black text-text-muted before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10"><span>ou</span></div>
        <a class="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black leading-none text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-amber-accent hover:shadow-[0_0_15px_rgba(200,135,58,0.2)]" href="<?= url('google-login.php') ?>">Cadastrar com Google</a>
        <a class="justify-self-center text-text-muted text-center transition-all duration-300 hover:text-amber-glow" href="<?= url('login.php') ?>">Ja tenho conta</a>
    </form>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
