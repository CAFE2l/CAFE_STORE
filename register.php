<?php
require_once __DIR__ . '/config/helpers.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';

    if (mb_strlen($name) < 2 || !$email || mb_strlen($password) < 6) {
        flash('error', 'Informe nome, e-mail válido e senha com pelo menos 6 caracteres.');
    } else {
        try {
            $stmt = db()->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
            $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), 'customer']);
            $_SESSION['user_id'] = (int) db()->lastInsertId();
            flash('success', 'Conta criada. Bem-vindo à CAFÉ STORE.');
            redirect('profile.php');
        } catch (PDOException $e) {
            flash('error', 'Este e-mail já está cadastrado.');
        }
    }
}
include __DIR__ . '/includes/header.php';
?>
<section class="auth-shell">
    <form class="auth-card" method="post">
        <p class="eyebrow">cadastro</p>
        <h1>Criar conta</h1>
        <p class="muted mb-5">Entre para salvar pedidos, montar carrinhos e comprar assets digitais com rapidez.</p>
        <input name="name" placeholder="Nome" required>
        <input type="email" name="email" placeholder="E-mail" required>
        <input type="password" name="password" placeholder="Senha" minlength="6" required>
        <button class="btn primary full" type="submit">Cadastrar</button>
        <div class="auth-divider"><span>ou</span></div>
        <a class="btn ghost full" href="<?= url('google-login.php') ?>">Cadastrar com Google</a>
        <a class="muted text-center" href="<?= url('login.php') ?>">Já tenho conta</a>
    </form>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
