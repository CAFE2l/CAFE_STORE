<?php
require_once __DIR__ . '/../../config/helpers.php';

function handle_review_image_uploads($reviewId, array $files) {
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $baseDir = __DIR__ . '/../../uploads/reviews';
    if (!is_dir($baseDir)) {
        mkdir($baseDir, 0775, true);
    }

    foreach ($files['name'] as $index => $name) {
        if (($files['error'][$index] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            continue;
        }

        if (($files['size'][$index] ?? 0) > 3 * 1024 * 1024) {
            continue;
        }

        $tmp = $files['tmp_name'][$index];
        $mime = mime_content_type($tmp);
        if (!isset($allowed[$mime])) {
            continue;
        }

        $filename = 'review-' . (int) $reviewId . '-' . bin2hex(random_bytes(8)) . '.' . $allowed[$mime];
        $target = $baseDir . '/' . $filename;
        if (move_uploaded_file($tmp, $target)) {
            $url = 'uploads/reviews/' . $filename;
            $stmt = db()->prepare('INSERT INTO review_images (review_id, image_url, public_id) VALUES (?, ?, ?)');
            $stmt->execute([$reviewId, $url, null]);
        }
    }
}
