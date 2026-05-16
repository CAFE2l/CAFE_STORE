<?php
require_once __DIR__ . '/config/helpers.php';

if (!google_oauth_configured()) {
    flash('error', 'Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET antes de usar login com Google.');
    redirect('login.php');
}

$state = bin2hex(random_bytes(32));
$_SESSION['google_oauth_state'] = $state;

header('Location: ' . google_auth_url($state));
exit;
