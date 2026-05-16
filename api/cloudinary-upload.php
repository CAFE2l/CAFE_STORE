<?php
require_once __DIR__ . '/../config/helpers.php';
require_admin();

header('Content-Type: application/json');

// Upload real futuro:
// 1. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.
// 2. Receba $_FILES['image'].
// 3. Assine o upload ou use SDK PHP do Cloudinary.
// 4. Retorne secure_url para gravar em products.image_url.
echo json_encode([
    'mode' => 'mock',
    'message' => 'Neste MVP cadastre a URL da imagem manualmente no admin.',
]);
