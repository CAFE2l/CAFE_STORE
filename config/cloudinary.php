<?php
require_once __DIR__ . '/config.php';

function cloudinary_configured() {
    return CLOUDINARY_CLOUD_NAME !== '' && CLOUDINARY_API_KEY !== '' && CLOUDINARY_API_SECRET !== '';
}

function cloudinary_upload($filePath, $folder = 'cafe-store') {
    if (!cloudinary_configured()) {
        throw new RuntimeException('Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.');
    }

    $timestamp = time();
    $params = [
        'folder' => $folder,
        'timestamp' => $timestamp,
    ];
    ksort($params);
    $signatureBase = http_build_query($params, '', '&') . CLOUDINARY_API_SECRET;
    $signature = sha1($signatureBase);

    $post = [
        'file' => new CURLFile($filePath),
        'api_key' => CLOUDINARY_API_KEY,
        'timestamp' => $timestamp,
        'folder' => $folder,
        'signature' => $signature,
    ];

    $ch = curl_init('https://api.cloudinary.com/v1_1/' . rawurlencode(CLOUDINARY_CLOUD_NAME) . '/image/upload');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $body = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($body === false || $error !== '') {
        throw new RuntimeException('Falha no upload Cloudinary.');
    }

    $json = json_decode($body, true);
    if (!is_array($json) || empty($json['secure_url'])) {
        throw new RuntimeException('Resposta inválida do Cloudinary.');
    }

    return $json;
}
