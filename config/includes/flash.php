<?php
// includes/flash.php
// Exibe mensagens de sessão (sucesso, erro, aviso) com segurança PHP 7.2+
if (isset($_SESSION['flash']) && is_array($_SESSION['flash'])) {
    foreach ($_SESSION['flash'] as $type => $message) {
        $type = strtolower($type);
        $class = 'p-4 mb-4 rounded border-l-4 ';
        
        if ($type === 'success') $class .= 'border-green-500 bg-green-50 text-green-800';
        elseif ($type === 'error') $class .= 'border-red-500 bg-red-50 text-red-800';
        elseif ($type === 'warning') $class .= 'border-yellow-500 bg-yellow-50 text-yellow-800';
        else $class .= 'border-blue-500 bg-blue-50 text-blue-800';

        echo '<div class="' . $class . '">' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</div>';
    }
    // Limpa as mensagens após exibir
    unset($_SESSION['flash']);
}
