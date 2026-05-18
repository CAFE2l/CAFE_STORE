<?php
require_once __DIR__ . '/config/helpers.php';

if (!google_oauth_configured()) {
    flash('error', 'Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET antes de usar login com Google.');
    redirect('login.php');
}

$expectedState = $_SESSION['google_oauth_state'] ?? '';
$state = $_GET['state'] ?? '';
$code = $_GET['code'] ?? '';
unset($_SESSION['google_oauth_state']);

if ($expectedState === '' || !hash_equals($expectedState, (string) $state)) {
    flash('error', 'Não foi possível validar a tentativa de login com Google.');
    redirect('login.php');
}

if ($code === '') {
    flash('error', 'Login com Google cancelado ou inválido.');
    redirect('login.php');
}

try {
    $token = google_http_request('https://oauth2.googleapis.com/token', 'POST', [
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'code' => $code,
        'grant_type' => 'authorization_code',
        'redirect_uri' => google_redirect_uri(),
    ]);

    if (empty($token['access_token'])) {
        throw new RuntimeException('Token do Google não recebido.');
    }

    $profile = google_http_request('https://www.googleapis.com/oauth2/v3/userinfo?access_token=' . urlencode((string) $token['access_token']));
    $user = login_with_google_user($profile);

    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['id'];
    unset($_SESSION['user_cache']);
    flash('success', 'Login com Google realizado com sucesso.');
    $target = redirect_after_login_path();
    redirect(($user['role'] ?? 'customer') === 'admin' && $target === 'profile.php' ? 'admin/dashboard.php' : $target);
} catch (Throwable $e) {
    flash('error', 'Falha no login com Google. Tente novamente.');
    redirect('login.php');
}
