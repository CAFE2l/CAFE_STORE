<?php foreach (flashes() as $flash): ?>
    <div class="flash-toast <?= $flash['type'] === 'success' ? 'flash-toast-success' : ($flash['type'] === 'error' ? 'flash-toast-error' : '') ?>" role="status">
        <span class="mt-1 h-2 w-2 shrink-0 rounded-full <?= $flash['type'] === 'success' ? 'bg-state-success' : ($flash['type'] === 'error' ? 'bg-state-error' : 'bg-amber-glow') ?>"></span>
        <span><?= e($flash['message']) ?></span>
    </div>
<?php endforeach; ?>
