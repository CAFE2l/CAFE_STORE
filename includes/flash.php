<?php foreach (flashes() as $flash): ?>
    <div class="mb-[18px] rounded-[10px] border border-white/10 bg-white/5 p-3.5 backdrop-blur <?= $flash['type'] === 'success' ? '!border-green-500/30' : ($flash['type'] === 'error' ? '!border-fire-500/40' : '') ?>"><?= e($flash['message']) ?></div>
<?php endforeach; ?>
