<?php
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../../config/cloudinary.php';
require_admin();
require_post();

header('Content-Type: application/json');

if (!cloudinary_configured()) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'message' => 'Cloudinary não configurado.']);
    exit;
}

echo json_encode(['ok' => true, 'message' => 'Endpoint preparado. Implemente destroy por public_id quando necessário.']);
