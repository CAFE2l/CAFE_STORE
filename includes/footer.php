</main>
<footer class="site-footer-panel">
    <div class="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 md:grid-cols-[1.35fr_1fr_1fr] md:px-6 lg:px-8">
        <div>
            <a class="inline-flex items-center gap-2.5 font-black tracking-tight" href="<?= url(
                "index.php",
            ) ?>" aria-label="CAFÉ STORE">
                <span class="brand-logo h-9 w-9 shrink-0 overflow-hidden rounded-[10px]">
                    <img src="<?= url(
                        "assets/images/icons/favicon.png",
                    ) ?>" alt="CAFÉ STORE" width="36" height="36" class="h-9 w-9 object-contain">
                </span>
                <span class="text-2xl font-black leading-none text-white">CAFÉ <span class="bg-gradient-to-r from-fire-500 via-ember-500 to-glow-400 bg-clip-text text-transparent">STORE</span></span>
            </a>
            <p class="mt-5 max-w-[320px] leading-relaxed text-midnight-400">Sua identidade digital começa aqui.</p>
            <div class="mt-6 flex gap-3">
                <a class="footer-social" href="<?= e(whatsapp_url('Olá, vim pelo site da CAFÉ STORE e quero falar sobre um projeto.')) ?>" target="_blank" rel="noopener" aria-label="WhatsApp">
                    <img src="<?= url('assets/images/icons/Whatsapp.png') ?>" alt="WhatsApp" class="h-5 w-5 object-contain">
                </a>
                <a class="footer-social" href="<?= e(TELEGRAM_CLIENT_CHANNEL_URL) ?>" target="_blank" rel="noopener" aria-label="Telegram">
                    <img src="<?= url('assets/images/icons/Telegram.png') ?>" alt="Telegram" class="h-5 w-5 object-contain">
                </a>
                <a class="footer-social" href="<?= e(DISCORD_COMMUNITY_URL) ?>" target="_blank" rel="noopener" aria-label="Comunidade Discord de devs e startups">
                    <img src="<?= url('assets/images/icons/Discord.png') ?>" alt="Discord" class="h-5 w-5 object-contain">
                </a>
            </div>
        </div>

        <div>
            <h3 class="footer-heading">Serviços</h3>
            <nav class="mt-6 grid gap-4">
                <a href="<?= url("services.php") ?>">Sites</a>
                <a href="<?= url("services.php") ?>">Landing pages</a>
                <a href="<?= url("services.php") ?>">Vídeos</a>
                <a href="<?= url("services.php") ?>">Web aplicações</a>
            </nav>
        </div>

        <div>
            <h3 class="footer-heading">Links</h3>
            <nav class="mt-6 grid gap-4">
                <a href="<?= url("products.php") ?>">Produtos</a>
                <a href="<?= url("services.php") ?>">Serviços</a>
                <a href="<?= url("cart.php") ?>">Carrinho</a>
            </nav>
        </div>
    </div>
    <div class="border-t border-white/5">
        <div class="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-6 text-sm text-midnight-500 md:px-6 lg:px-8 max-sm:flex-col max-sm:items-start">
            <span>© 2026 CAFÉ STORE. Todos os direitos reservados.</span>
            <span>Sites, vídeos e web aplicações para negócios.</span>
        </div>
    </div>
</footer>
<script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"></script>
<script src="<?= url("assets/js/firebase.js") ?>"></script>
<script src="<?= url("assets/js/app.js") ?>"></script>
</body>
</html>
