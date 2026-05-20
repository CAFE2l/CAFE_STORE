<?php
/**
 * Seed manual de produtos da CAFÉ STORE.
 *
 * Este arquivo NÃO deve ser chamado automaticamente durante a inicialização
 * do banco. Execute manualmente via CLI:
 *
 * php database/seeds/products_seed.php
 *
 * Também pode ser chamado como rota protegida por admin via POST, se necessário.
 */

require_once __DIR__ . '/../../config/helpers.php';

function seed_support_products_catalog(PDO $pdo) {
    $categories = [
        ['Camisetas', 'camisetas'],
        ['Acessórios', 'acessorios'],
        ['Chaveiros', 'chaveiros'],
        ['Canecas', 'canecas'],
        ['Moletons', 'moletons'],
    ];

    $categoryIds = [];
    $categoryStmt = $pdo->prepare("
        INSERT INTO categories (name, slug)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name)
    ");
    $categorySelect = $pdo->prepare("SELECT id FROM categories WHERE slug = ? LIMIT 1");
    foreach ($categories as [$name, $slug]) {
        $categoryStmt->execute([$name, $slug]);
        $categorySelect->execute([$slug]);
        $categoryIds[$slug] = (int) $categorySelect->fetchColumn();
    }

    $serviceSlugs = [
        'site-institucional-para-negocios',
        'landing-page-de-alta-conversao',
        'video-curto-para-redes-sociais',
        'video-longo-profissional',
        'web-aplicacao-para-empresas',
        'kit-de-acessorios-cafe',
    ];
    $serviceStmt = $pdo->prepare("UPDATE products SET status = 'draft' WHERE slug = ?");
    foreach ($serviceSlugs as $slug) {
        $serviceStmt->execute([$slug]);
    }

    $products = [
        [
            'camisetas',
            'Camiseta CAFÉ STORE Limited Edition',
            'camiseta-cafe-store-limited-edition',
            'Camiseta preta limited edition da CAFÉ STORE com estampa premium do mascote flame na frente, ícone na manga, tag personalizada e arte traseira com a frase CREATE BUILD INSPIRE. Malha 100% algodão, toque macio, alta durabilidade e cores vibrantes. Este item funciona como apoio/donate; produção e entrega física dependem de campanha confirmada.',
            'Camiseta preta limited edition com mascote frontal, arte traseira CREATE BUILD INSPIRE, tag personalizada e malha 100% algodão.',
            79.90,
            50,
            'camiseta',
        ],
        [
            'camisetas',
            'Camiseta CAFÉ STORE Dry Pro Poliéster',
            'camiseta-cafe-store-dry-pro-poliester',
            'Camiseta performance tech tee em poliéster dry pro com visual preto e laranja, mascote frontal, identidade CAFÉ STORE nas mangas e arte traseira CREATE BUILD INSPIRE. Tecido respirável, secagem rápida, proteção UV, leveza e flexibilidade para quem vive o digital. Este item funciona como apoio/donate; produção e entrega física dependem de campanha confirmada.',
            'Camiseta de poliéster dry pro com visual tech, respirável, secagem rápida, proteção UV e arte CAFÉ STORE.',
            89.90,
            50,
            'camiseta',
        ],
        [
            'chaveiros',
            'Chaveiro Flame CAFÉ',
            'chaveiro-flame-cafe',
            'Chaveiro simbólico com identidade da CAFÉ STORE para quem quer apoiar o projeto. Campanhas físicas serão comunicadas separadamente.',
            'Chaveiro simbólico da marca CAFÉ.',
            19.90,
            120,
            'chaveiro',
        ],
        [
            'canecas',
            'Caneca CAFÉ STORE',
            'caneca-cafe-store',
            'Caneca simbólica da CAFÉ STORE para apoiadores da marca. Este item representa apoio/donate enquanto a produção oficial não estiver ativa.',
            'Caneca simbólica para apoiar a marca.',
            44.90,
            60,
            'caneca',
        ],
        [
            'moletons',
            'Moletom CAFÉ STORE Support',
            'moletom-cafe-store-support',
            'Moletom simbólico da CAFÉ STORE para apoiadores. Compra registrada como apoio ao projeto, com entrega física apenas quando houver campanha oficial.',
            'Moletom simbólico para apoiadores.',
            119.90,
            30,
            'moletom',
        ],
    ];

    $productStmt = $pdo->prepare("
        INSERT INTO products (category_id, name, slug, description, short_description, price, old_price, image_url, main_image_url, stock, type, is_digital, status)
        VALUES (?, ?, ?, ?, ?, ?, NULL, '', '', ?, ?, 1, 'active')
        ON DUPLICATE KEY UPDATE
            category_id = VALUES(category_id),
            name = VALUES(name),
            description = VALUES(description),
            short_description = VALUES(short_description),
            price = VALUES(price),
            stock = VALUES(stock),
            type = VALUES(type),
            is_digital = 1,
            status = 'active'
    ");

    foreach ($products as [$categorySlug, $name, $slug, $description, $shortDescription, $price, $stock, $type]) {
        $productStmt->execute([
            $categoryIds[$categorySlug] ?? null,
            $name,
            $slug,
            $description,
            $shortDescription,
            $price,
            $stock,
            $type,
        ]);
    }

    if (table_exists($pdo, 'product_images')) {
        $seededImages = [
            'camiseta-cafe-store-limited-edition' => [
                'main' => 'assets/images/produtos/camisa_normal/preta/design.jpeg',
                'gallery' => [
                    'assets/images/produtos/camisa_normal/preta/camisaVtirine.png',
                    'assets/images/produtos/camisa_normal/preta/camisa_tras.png',
                    'assets/images/produtos/camisa_normal/preta/banner.png',
                ],
            ],
            'camiseta-cafe-store-dry-pro-poliester' => [
                'main' => 'assets/images/produtos/poliester/preta/design.png',
                'gallery' => [
                    'assets/images/produtos/poliester/preta/camisa_poliester.png',
                    'assets/images/produtos/poliester/preta/frente.jpeg',
                    'assets/images/produtos/poliester/preta/tras.png',
                ],
            ],
            'chaveiro-flame-cafe' => [
                'main' => 'assets/images/produtos/chaveiro/design.png',
                'gallery' => [
                    'assets/images/produtos/chaveiro/frente.png',
                    'assets/images/produtos/chaveiro/verso.png',
                ],
            ],
            'caneca-cafe-store' => [
                'main' => 'assets/images/produtos/caneca/preta/design.png',
                'gallery' => [
                    'assets/images/produtos/caneca/preta/frente.png',
                    'assets/images/produtos/caneca/preta/tras.png',
                    'assets/images/produtos/caneca/preta/banner.png',
                ],
            ],
            'moletom-cafe-store-support' => [
                'main' => 'assets/images/produtos/moletons/design.png',
                'gallery' => [
                    'assets/images/produtos/moletons/design.png',
                ],
            ],
        ];

        $selectProduct = $pdo->prepare("SELECT id FROM products WHERE slug = ? LIMIT 1");
        $updateProductImage = $pdo->prepare("UPDATE products SET image_url = ?, main_image_url = ? WHERE id = ?");
        $deleteImages = $pdo->prepare("DELETE FROM product_images WHERE product_id = ?");
        $insertImage = $pdo->prepare("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)");

        foreach ($seededImages as $slug => $imageSet) {
            $selectProduct->execute([$slug]);
            $productId = (int) $selectProduct->fetchColumn();
            if ($productId <= 0) {
                continue;
            }

            $updateProductImage->execute([$imageSet['main'], $imageSet['main'], $productId]);
            $deleteImages->execute([$productId]);
            foreach ($imageSet['gallery'] as $sortOrder => $imageUrl) {
                $insertImage->execute([$productId, $imageUrl, $sortOrder]);
            }
        }
    }
}

if (PHP_SAPI !== 'cli') {
    require_admin();

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        http_response_code(405);
        echo 'Seed manual de produtos: envie uma requisição POST autenticada como admin para executar.';
        exit;
    }
}

seed_support_products_catalog(db());

if (PHP_SAPI === 'cli') {
    echo "Seed manual de produtos executado com sucesso.\n";
    exit;
}

echo 'Seed manual de produtos executado com sucesso.';
