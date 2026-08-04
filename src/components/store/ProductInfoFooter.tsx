'use client';

import { motion, type Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, delay: i * 0.12, ease: 'easeOut' },
  }),
};

// ─── Block 1: Brand Identity ──────────────────────────────────────────────────

function BrandBlock() {
  const items = [
    { icon: '👕', label: 'Camisetas', desc: 'Malha premium 100% algodão 30.1 com estampa exclusiva.' },
    { icon: '⚡', label: 'Tech T-Shirts', desc: 'Dry-fit técnico com design urbano e acabamento de alta qualidade.' },
    { icon: '🧥', label: 'Hoodies / Moletons', desc: 'Moletom encorpado 320g/m² com modelagem confortável.' },
    { icon: '🔑', label: 'Chaveiros', desc: 'Acessório metálico com identidade visual da marca.' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-lg">
          ☕
        </span>
        <div>
          <p className="text-sm font-bold text-white">Identidade CAFÉ STORE</p>
          <p className="text-xs text-zinc-500">Apoio simbólico com design exclusivo</p>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-zinc-400">
        Cada item representa um apoio simbólico ao projeto CAFÉ STORE — uma marca independente de
        cultura urbana e tecnologia. Ao contribuir, você faz parte de algo maior.
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="group flex flex-col gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 transition-all duration-300 hover:border-brand/25 hover:bg-zinc-900/70 hover:shadow-[0_0_18px_rgba(249,115,22,0.06)]"
          >
            <span className="text-base">{item.icon}</span>
            <p className="text-xs font-semibold text-white">{item.label}</p>
            <p className="text-[11px] leading-relaxed text-zinc-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {['Design exclusivo', 'Modelagem premium', 'Estilo urbano/tech', 'Marca independente'].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-brand/20 bg-brand/8 px-2.5 py-1 text-[11px] font-medium text-brand/80"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Block 2: Payment & Security ─────────────────────────────────────────────

function PaymentBlock() {
  const methods = [
    {
      name: 'Pix',
      detail: 'Aprovação instantânea',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M11.354 2.646a.9.9 0 0 1 1.292 0l2.122 2.122a.9.9 0 0 0 .636.264h2.996a.9.9 0 0 1 .9.9v2.996a.9.9 0 0 0 .264.636l2.122 2.122a.9.9 0 0 1 0 1.292l-2.122 2.122a.9.9 0 0 0-.264.636v2.996a.9.9 0 0 1-.9.9h-2.996a.9.9 0 0 0-.636.264l-2.122 2.122a.9.9 0 0 1-1.292 0l-2.122-2.122a.9.9 0 0 0-.636-.264H5.6a.9.9 0 0 1-.9-.9v-2.996a.9.9 0 0 0-.264-.636L2.314 13.28a.9.9 0 0 1 0-1.292l2.122-2.122A.9.9 0 0 0 4.7 9.23V6.932a.9.9 0 0 1 .9-.9h2.996a.9.9 0 0 0 .636-.264z" />
        </svg>
      ),
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-400/20',
    },
    {
      name: 'Cartão de Crédito',
      detail: 'Parcelado em até 12×',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      color: 'text-blue-400',
      bg: 'bg-blue-400/10 border-blue-400/20',
    },
    {
      name: 'Mercado Pago',
      detail: 'Checkout seguro',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="10" opacity=".15" />
          <path d="M7 12.5c0-2.76 2.24-5 5-5s5 2.24 5 5" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="14" r="1.5" />
        </svg>
      ),
      color: 'text-sky-400',
      bg: 'bg-sky-400/10 border-sky-400/20',
    },
    {
      name: 'PayPal',
      detail: 'Proteção ao comprador',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M7.076 21.337H4.272a.641.641 0 0 1-.633-.74L5.858 3.67a.77.77 0 0 1 .76-.65h5.74c2.59 0 4.39 1.12 4.84 3.07.19.82.16 1.6-.07 2.32-.05.16-.1.31-.17.46.73.42 1.27 1.01 1.52 1.77.32.97.22 2.1-.29 3.17-.6 1.27-1.56 2.17-2.77 2.6-.73.26-1.54.39-2.41.39h-.61c-.44 0-.82.32-.89.76l-.71 4.52a.641.641 0 0 1-.63.54z" opacity=".6" />
          <path d="M19.5 8.5c-.1.6-.3 1.15-.6 1.63-.8 1.3-2.2 1.87-4.1 1.87h-1.04c-.25 0-.46.18-.5.43l-.63 4.02-.18 1.13a.27.27 0 0 0 .27.31h1.88c.22 0 .41-.16.44-.38l.02-.1.35-2.2.02-.12c.03-.22.22-.38.44-.38h.28c1.8 0 3.2-.73 3.61-2.84.17-.88.08-1.61-.37-2.13a1.77 1.77 0 0 0-.39-.24z" />
        </svg>
      ),
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10 border-indigo-400/20',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-lg">
          🔒
        </span>
        <div>
          <p className="text-sm font-bold text-white">Pagamento & Segurança</p>
          <p className="text-xs text-zinc-500">Transações criptografadas SSL/TLS</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {methods.map((m) => (
          <div
            key={m.name}
            className={`group flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 hover:shadow-[0_0_16px_rgba(249,115,22,0.05)] ${m.bg}`}
          >
            <span className={`shrink-0 ${m.color}`}>{m.icon}</span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{m.name}</p>
              <p className="truncate text-[11px] text-zinc-500">{m.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p className="text-[11px] leading-relaxed text-zinc-400">
          Todos os pagamentos são processados com criptografia de ponta a ponta. Seus dados financeiros
          nunca são armazenados em nossos servidores.
        </p>
      </div>
    </div>
  );
}

// ─── Block 3: Transparency ────────────────────────────────────────────────────

function TransparencyBlock() {
  const points = [
    {
      icon: '🎨',
      title: 'Imagens ilustrativas',
      desc: 'As fotos dos produtos representam o design e a identidade visual da marca. São criadas para demonstrar o conceito.',
    },
    {
      icon: '💝',
      title: 'Apoio simbólico',
      desc: 'O valor pago funciona como uma contribuição voluntária ao projeto CAFÉ STORE, não como compra de produto físico.',
    },
    {
      icon: '📦',
      title: 'Sem envio físico',
      desc: 'Não há entrega de mercadoria. Ao concluir o apoio, você recebe uma confirmação digital da sua contribuição.',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-lg">
          📋
        </span>
        <div>
          <p className="text-sm font-bold text-white">Transparência Total</p>
          <p className="text-xs text-zinc-500">Entenda como funciona o apoio</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {points.map((p) => (
          <div
            key={p.title}
            className="group flex gap-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all duration-300 hover:border-brand/20 hover:bg-zinc-900/70 hover:shadow-[0_0_18px_rgba(249,115,22,0.05)]"
          >
            <span className="mt-0.5 shrink-0 text-base">{p.icon}</span>
            <div>
              <p className="text-xs font-semibold text-white">{p.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-brand/15 bg-brand/5 p-4">
        <p className="text-[11px] leading-relaxed text-zinc-300">
          <span className="font-semibold text-brand">Dúvidas?</span> Entre em contato pelo WhatsApp ou
          acesse nossa{' '}
          <a href="/politica-de-privacidade" className="underline underline-offset-2 transition hover:text-brand">
            Política de Privacidade
          </a>{' '}
          e{' '}
          <a href="/termos-de-uso" className="underline underline-offset-2 transition hover:text-brand">
            Termos de Uso
          </a>
          .
        </p>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ProductInfoFooter() {
  return (
    <section aria-label="Informações do produto" className="mx-auto mt-14 max-w-7xl px-6 pb-4">
      {/* Divider */}
      <div className="mb-10 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
        <span className="flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-4 py-1.5 text-xs font-semibold text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Sobre este apoio
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {([
          <BrandBlock key="brand" />,
          <PaymentBlock key="payment" />,
          <TransparencyBlock key="transparency" />,
        ] as const).map((block, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700"
          >
            {block}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
