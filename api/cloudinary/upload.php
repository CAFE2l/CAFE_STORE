<?php
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../../config/cloudinary.php';
require_admin();
require_post();

header('Content-Type: application/json');

if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Envie uma imagem válida.']);
    exit;
}

if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Imagem maior que 5MB.']);
    exit;
}

$mime = mime_content_type($_FILES['image']['tmp_name']);
if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Tipo de imagem inválido.']);
    exit;
}

try {
    $result = cloudinary_upload($_FILES['image']['tmp_name'], $_POST['folder'] ?? 'cafe-store');
    echo json_encode([
        'ok' => true,
        'secure_url' => $result['secure_url'],
        'public_id' => $result['public_id'] ?? null,
    ]);
} catch (Throwable $e) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'message' => $e->getMessage()]);
}
