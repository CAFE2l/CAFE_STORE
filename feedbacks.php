<?php
require_once __DIR__ . '/config/helpers.php';

$user = current_user();
$categories = ['Websites', 'Landing Pages', 'SaaS', 'Vídeos curtos', 'Vídeos longos', 'Web aplicações', 'Identidade Visual'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_login();

    if (!verify_csrf_token($_POST['csrf_token'] ?? '')) {
        flash('error', 'Sessão expirada. Tente novamente.');
        redirect('feedbacks.php');
    }

    $rating = max(1, min(5, (int) ($_POST['rating'] ?? 5)));
    $clientName = trim((string) ($_POST['client_name'] ?? ''));
    $roleCompany = trim((string) ($_POST['role_company'] ?? ''));
    $projectName = trim((string) ($_POST['project_name'] ?? ''));
    $category = trim((string) ($_POST['category'] ?? ''));
    $projectSummary = trim((string) ($_POST['project_summary'] ?? ''));
    $results = trim((string) ($_POST['results'] ?? ''));
    $feedbackText = trim((string) ($_POST['feedback_text'] ?? ''));
    $storySteps = trim((string) ($_POST['story_steps'] ?? ''));
    $stackUsed = trim((string) ($_POST['stack_used'] ?? ''));

    if ($clientName === '') {
        $clientName = $user['name'] ?? 'Cliente CAFÉ';
    }

    if ($projectName === '' || $feedbackText === '' || !in_array($category, $categories, true)) {
        flash('error', 'Informe projeto, categoria e feedback do cliente.');
        redirect('feedbacks.php#enviar');
    }

    $media = [];
    $allowedTypes = [
        'image/jpeg' => ['ext' => 'jpg', 'type' => 'image'],
        'image/png' => ['ext' => 'png', 'type' => 'image'],
        'image/webp' => ['ext' => 'webp', 'type' => 'image'],
        'video/mp4' => ['ext' => 'mp4', 'type' => 'video'],
        'video/webm' => ['ext' => 'webm', 'type' => 'video'],
        'video/quicktime' => ['ext' => 'mov', 'type' => 'video'],
        'audio/mpeg' => ['ext' => 'mp3', 'type' => 'audio'],
        'audio/wav' => ['ext' => 'wav', 'type' => 'audio'],
        'audio/ogg' => ['ext' => 'ogg', 'type' => 'audio'],
        'audio/webm' => ['ext' => 'webm', 'type' => 'audio'],
    ];

    if (!empty($_FILES['media_files']['name'][0])) {
        $uploadDir = __DIR__ . '/assets/uploads/feedbacks';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        if (!is_writable($uploadDir)) {
            @chmod($uploadDir, 0777);
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $fileCount = min(4, count($_FILES['media_files']['name']));

        for ($i = 0; $i < $fileCount; $i++) {
            if (($_FILES['media_files']['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                continue;
            }

            if (($_FILES['media_files']['error'][$i] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
                flash('error', 'Um dos arquivos não pôde ser enviado.');
                redirect('feedbacks.php#enviar');
            }

            if (($_FILES['media_files']['size'][$i] ?? 0) > 12 * 1024 * 1024) {
                flash('error', 'Cada arquivo precisa ter até 12MB.');
                redirect('feedbacks.php#enviar');
            }

            $mime = $finfo->file($_FILES['media_files']['tmp_name'][$i]);
            if (!isset($allowedTypes[$mime])) {
                flash('error', 'Use imagens JPG, PNG, WebP, vídeos MP4/WebM/MOV ou áudio MP3/WAV/OGG.');
                redirect('feedbacks.php#enviar');
            }

            if (!is_writable($uploadDir)) {
                flash('error', 'A pasta de feedbacks não tem permissão de escrita.');
                redirect('feedbacks.php#enviar');
            }

            $meta = $allowedTypes[$mime];
            $filename = 'feedback-' . (int) $user['id'] . '-' . bin2hex(random_bytes(6)) . '.' . $meta['ext'];
            $target = $uploadDir . '/' . $filename;

            if (!@move_uploaded_file($_FILES['media_files']['tmp_name'][$i], $target)) {
                flash('error', 'Falha ao salvar um arquivo enviado.');
                redirect('feedbacks.php#enviar');
            }

            $media[] = [
                'type' => $meta['type'],
                'url' => 'assets/uploads/feedbacks/' . $filename,
                'name' => (string) ($_FILES['media_files']['name'][$i] ?? $filename),
            ];
        }
    }

    $stmt = db()->prepare("
        INSERT INTO client_feedbacks
            (user_id, rating, client_name, role_company, project_name, category, project_summary, results, feedback_text, story_steps, stack_used, media_json, status)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
    ");
    $stmt->execute([
        (int) $user['id'],
        $rating,
        mb_substr($clientName, 0, 120),
        mb_substr($roleCompany, 0, 180),
        mb_substr($projectName, 0, 160),
        $category,
        $projectSummary,
        $results,
        $feedbackText,
        $storySteps,
        mb_substr($stackUsed, 0, 255),
        json_encode($media, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    ]);

    flash('success', 'Feedback enviado. Obrigado por transformar seu depoimento em case.');
    redirect('feedbacks.php');
}

$filter = trim((string) ($_GET['category'] ?? ''));
$where = ["status = 'approved'"];
$params = [];
if ($filter !== '' && in_array($filter, $categories, true)) {
    $where[] = 'category = ?';
    $params[] = $filter;
}

$stmt = db()->prepare('SELECT * FROM client_feedbacks WHERE ' . implode(' AND ', $where) . ' ORDER BY created_at DESC');
$stmt->execute($params);
$feedbacks = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>
<section class="grid items-end gap-6 py-8 lg:grid-cols-[1fr_auto]">
    <div>
        <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">prova social</p>
        <h1 class="m-0 max-w-[760px] text-[clamp(2.4rem,5vw,4.6rem)] font-black leading-tight tracking-tight">
            Feedbacks que viram <span class="text-amber-glow">cases reais</span>
        </h1>
        <p class="mt-5 max-w-[48rem] text-[1.05rem] leading-relaxed text-text-muted">Aqui o cliente mostra o projeto entregue, resultado, stack usada, imagens, prints ou vídeos. Não é só elogio: é contexto, história e prova do trabalho.</p>
    </div>
    <a class="btn-primary" href="#enviar">Enviar feedback</a>
</section>

<form class="mb-6 flex flex-wrap gap-2" method="get">
    <a class="inline-flex min-h-[38px] items-center rounded-[10px] border <?= $filter === '' ? 'border-amber-accent bg-amber-accent text-background' : 'border-white/20 bg-white/5 text-text-primary' ?> px-4 font-black" href="<?= url('feedbacks.php') ?>">Todos</a>
    <?php foreach ($categories as $category): ?>
        <a class="inline-flex min-h-[38px] items-center rounded-[10px] border <?= $filter === $category ? 'border-amber-accent bg-amber-accent text-background' : 'border-white/20 bg-white/5 text-text-primary' ?> px-4 font-black" href="<?= url('feedbacks.php?category=' . urlencode($category)) ?>"><?= e($category) ?></a>
    <?php endforeach; ?>
</form>

<div class="grid gap-5 lg:grid-cols-3 md:grid-cols-2">
    <?php foreach ($feedbacks as $feedback): ?>
        <?php
        $media = json_decode($feedback['media_json'] ?? '[]', true);
        $media = is_array($media) ? $media : [];
        $firstMedia = $media[0] ?? null;
        $modalId = 'feedback-modal-' . (int) $feedback['id'];
        ?>
        <article class="flex min-h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-secondary/40">
            <button class="block border-0 bg-transparent p-0 text-left" type="button" onclick="document.getElementById('<?= e($modalId) ?>').showModal()">
                <?php if ($firstMedia && ($firstMedia['type'] ?? '') === 'image'): ?>
                    <img src="<?= e(url($firstMedia['url'])) ?>" alt="<?= e($feedback['project_name']) ?>" class="aspect-[16/10] w-full bg-background/80 object-cover">
                <?php elseif ($firstMedia && ($firstMedia['type'] ?? '') === 'video'): ?>
                    <video src="<?= e(url($firstMedia['url'])) ?>" class="aspect-[16/10] w-full bg-background/80 object-cover" muted></video>
                <?php elseif ($firstMedia && ($firstMedia['type'] ?? '') === 'audio'): ?>
                    <div class="grid aspect-[16/10] place-items-center bg-background p-5 text-center">
                        <span class="text-4xl font-black text-amber-glow">ÁUDIO</span>
                    </div>
                <?php else: ?>
                    <div class="grid aspect-[16/10] place-items-center bg-background text-5xl font-black text-amber-glow">CAFÉ</div>
                <?php endif; ?>
            </button>
            <div class="flex flex-1 flex-col p-5">
                <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span class="inline-flex w-fit rounded-full border border-white/20 px-3 py-1 text-xs font-black text-amber-glow"><?= e($feedback['category']) ?></span>
                    <span class="text-amber-glow"><?= str_repeat('★', (int) $feedback['rating']) ?><?= str_repeat('☆', 5 - (int) $feedback['rating']) ?></span>
                </div>
                <h2 class="m-0 text-xl font-black text-text-primary"><?= e($feedback['project_name']) ?></h2>
                <p class="mt-2 text-sm font-bold text-text-muted"><?= e($feedback['client_name']) ?><?= $feedback['role_company'] ? ' • ' . e($feedback['role_company']) : '' ?></p>
                <p class="mt-4 line-clamp-4 leading-relaxed text-text-secondary"><?= e($feedback['feedback_text']) ?></p>
                <?php if (!empty($feedback['results'])): ?>
                    <div class="mt-4 rounded-[10px] border border-amber-accent/30 bg-amber-accent/10 p-3 text-sm font-bold text-amber-glow"><?= nl2br(e($feedback['results'])) ?></div>
                <?php endif; ?>
                <button class="mt-5 inline-flex min-h-[44px] w-fit items-center justify-center rounded-[10px] border border-white/20 bg-white/5 px-[18px] font-black text-text-primary transition-all duration-300 hover:border-amber-accent" type="button" onclick="document.getElementById('<?= e($modalId) ?>').showModal()">Ver case</button>
            </div>
        </article>

        <dialog id="<?= e($modalId) ?>" class="w-[min(960px,calc(100vw-24px))] rounded-2xl border border-white/10 bg-background p-0 text-text-primary backdrop:bg-black/75">
            <div class="grid max-h-[88vh] overflow-y-auto">
                <div class="flex items-center justify-between gap-4 border-b border-white/10 p-5">
                    <div>
                        <p class="mb-1 text-xs font-black uppercase tracking-[0.12em] text-amber-glow"><?= e($feedback['category']) ?></p>
                        <h3 class="m-0 text-2xl font-black"><?= e($feedback['project_name']) ?></h3>
                    </div>
                    <form method="dialog">
                        <button class="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/20 bg-white/5 font-black text-text-primary" type="submit">×</button>
                    </form>
                </div>
                <div class="grid gap-5 p-5 lg:grid-cols-[1.15fr_0.85fr]">
                    <div class="grid gap-3">
                        <?php if ($media): ?>
                            <?php foreach ($media as $item): ?>
                                <?php if (($item['type'] ?? '') === 'video'): ?>
                                    <video src="<?= e(url($item['url'])) ?>" controls class="w-full rounded-[10px] border border-white/10 bg-black"></video>
                                <?php elseif (($item['type'] ?? '') === 'audio'): ?>
                                    <audio src="<?= e(url($item['url'])) ?>" controls class="w-full rounded-[10px] border border-white/10 bg-background/80 p-3"></audio>
                                <?php else: ?>
                                    <img src="<?= e(url($item['url'])) ?>" alt="<?= e($item['name'] ?? $feedback['project_name']) ?>" class="w-full rounded-[10px] border border-white/10 bg-black object-cover">
                                <?php endif; ?>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <div class="rounded-[10px] border border-white/10 bg-background/80 p-8 text-center text-text-muted">Este case ainda não tem mídia enviada.</div>
                        <?php endif; ?>
                    </div>
                    <div class="grid content-start gap-4">
                        <section class="rounded-[10px] border border-white/10 bg-white/5 p-4">
                            <p class="mb-2 text-sm font-black text-amber-glow">Feedback do cliente</p>
                            <p class="leading-relaxed text-text-secondary">“<?= e($feedback['feedback_text']) ?>”</p>
                        </section>
                        <?php if (!empty($feedback['project_summary'])): ?>
                            <section class="rounded-[10px] border border-white/10 bg-white/5 p-4">
                                <p class="mb-2 text-sm font-black text-amber-glow">Projeto entregue</p>
                                <p class="leading-relaxed text-text-secondary"><?= nl2br(e($feedback['project_summary'])) ?></p>
                            </section>
                        <?php endif; ?>
                        <?php if (!empty($feedback['results'])): ?>
                            <section class="rounded-[10px] border border-amber-accent/30 bg-amber-accent/10 p-4">
                                <p class="mb-2 text-sm font-black text-amber-glow">Resultados</p>
                                <p class="leading-relaxed text-text-secondary"><?= nl2br(e($feedback['results'])) ?></p>
                            </section>
                        <?php endif; ?>
                        <?php if (!empty($feedback['stack_used'])): ?>
                            <section class="rounded-[10px] border border-white/10 bg-white/5 p-4">
                                <p class="mb-2 text-sm font-black text-amber-glow">Stack usada</p>
                                <p class="leading-relaxed text-text-secondary"><?= e($feedback['stack_used']) ?></p>
                            </section>
                        <?php endif; ?>
                        <?php if (!empty($feedback['story_steps'])): ?>
                            <section class="rounded-[10px] border border-white/10 bg-white/5 p-4">
                                <p class="mb-2 text-sm font-black text-amber-glow">História do projeto</p>
                                <p class="leading-relaxed text-text-secondary"><?= nl2br(e($feedback['story_steps'])) ?></p>
                            </section>
                        <?php endif; ?>
                        <p class="text-sm text-text-muted/60"><?= date('d/m/Y', strtotime((string) $feedback['created_at'])) ?></p>
                    </div>
                </div>
            </div>
        </dialog>
    <?php endforeach; ?>

    <?php if (!$feedbacks): ?>
        <p class="col-span-full glass rounded-2xl p-6 text-text-muted">Nenhum feedback publicado nesta categoria ainda.</p>
    <?php endif; ?>
</div>

<section id="enviar" class="mt-14 glass p-6">
    <p class="mb-2.5 text-[0.75rem] font-black uppercase tracking-[0.12em] text-amber-glow">enviar feedback</p>
    <h2 class="m-0 text-[clamp(1.8rem,4vw,3rem)] font-black text-text-primary">Transforme seu depoimento em case</h2>

    <?php if (!$user): ?>
        <p class="mt-4 max-w-[46rem] leading-relaxed text-text-muted">Faça login para enviar seu feedback com nome, projeto, resultado, mídia e stack usada.</p>
        <a class="btn-primary mt-5" href="<?= url('login.php') ?>">Entrar para enviar</a>
    <?php else: ?>
        <form class="mt-6 grid gap-4" method="post" enctype="multipart/form-data">
            <input type="hidden" name="csrf_token" value="<?= e(generate_csrf_token()) ?>">
            <div class="grid gap-4 md:grid-cols-3">
                <label class="grid gap-1.5 text-sm font-black text-text-muted">Nota
                    <select name="rating" class="input-field">
                        <?php for ($i = 5; $i >= 1; $i--): ?>
                            <option value="<?= $i ?>" class="text-black"><?= $i ?> estrelas</option>
                        <?php endfor; ?>
                    </select>
                </label>
                <label class="grid gap-1.5 text-sm font-black text-text-muted">Nome do cliente
                    <input name="client_name" value="<?= e($user['name']) ?>" class="input-field">
                </label>
                <label class="grid gap-1.5 text-sm font-black text-text-muted">Cargo/empresa
                    <input name="role_company" placeholder="Founder, editor, loja, canal..." class="input-field">
                </label>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                <label class="grid gap-1.5 text-sm font-black text-text-muted">Nome do projeto
                    <input name="project_name" required placeholder="Landing Page, Sistema Web, vídeo..." class="input-field">
                </label>
                <label class="grid gap-1.5 text-sm font-black text-text-muted">Categoria
                    <select name="category" required class="input-field">
                        <?php foreach ($categories as $category): ?>
                            <option value="<?= e($category) ?>" class="text-black"><?= e($category) ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
            </div>
            <label class="grid gap-1.5 text-sm font-black text-text-muted">Projeto entregue
                <textarea name="project_summary" rows="3" placeholder="Ex: Criamos uma landing page responsiva, vídeos curtos e estrutura de captação." class="input-field"></textarea>
            </label>
            <label class="grid gap-1.5 text-sm font-black text-text-muted">Resultados
                <textarea name="results" rows="3" placeholder="+300 leads, site 2x mais rápido, melhora de CTR, identidade mais profissional..." class="input-field"></textarea>
            </label>
            <label class="grid gap-1.5 text-sm font-black text-text-muted">Feedback do cliente
                <textarea name="feedback_text" rows="4" required placeholder="Conte o que mudou depois do projeto." class="input-field"></textarea>
            </label>
            <label class="grid gap-1.5 text-sm font-black text-text-muted">História do projeto
                <textarea name="story_steps" rows="4" placeholder="1. Cheguei sem identidade visual&#10;2. Criamos branding&#10;3. Desenvolvemos landing page&#10;4. Melhoramos conversão" class="input-field"></textarea>
            </label>
            <label class="grid gap-1.5 text-sm font-black text-text-muted">Stack usada
                <input name="stack_used" placeholder="React • Vite • Firebase • Tailwind • Cloudinary" class="input-field">
            </label>
            <label class="grid gap-1.5 text-sm font-black text-text-muted">Imagens, prints, vídeos curtos ou áudios
                <input type="file" name="media_files[]" multiple accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/ogg,audio/webm" class="rounded-[10px] border border-white/10 bg-background/60 p-2.5 text-text-primary file:mr-4 file:rounded-[8px] file:border-0 file:bg-amber-accent file:px-3 file:py-2 file:font-black file:text-background">
                <small class="text-text-muted/60">Até 4 arquivos, 12MB cada.</small>
            </label>
            <button class="btn-primary w-fit" type="submit">Enviar feedback</button>
        </form>
    <?php endif; ?>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
