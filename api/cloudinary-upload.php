<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();

header('Content-Type: application/json');

echo json_encode([
    'ok' => true,
    'message' => 'Use api/cloudinary/upload.php para upload assinado no backend.',
]);
