'use client';

import Image from 'next/image';
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

const CATEGORIES = [
  {
    label: 'Camisetas',
    desc: 'Malha premium 100% algodão 30.1 com estampa exclusiva.',
    img: '/images/produtos/camisa_normal/preta/camisaVtirine.png',
  },
  {
    label: 'Camisas Poliéster',
    desc: 'Tecido técnico dry-fit com design urbano e acabamento de alta qualidade.',
    img: '/images/produtos/poliester/preta/camisa_poliester.png',
  },
  {
    label: 'Moletons',
    desc: 'Moletom encorpado 320g/m² com modelagem confortável.',
    img: '/images/produtos/moletons/preto/frente.png',
  },
  {
    label: 'Chaveiros',
    desc: 'Acessório metálico com identidade visual da marca.',
    img: '/images/produtos/chaveiro/frente.png',
  },
] as const;

function BrandBlock() {
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
        {CATEGORIES.map((item) => (
          <div
            key={item.label}
            className="group flex flex-col gap-2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 transition-all duration-300 hover:border-brand/25 hover:bg-zinc-900/70 hover:shadow-[0_0_18px_rgba(249,115,22,0.07)]"
          >
            <div className="relative h-24 w-full overflow-hidden bg-zinc-800/60">
              <Image
                src={item.img}
                alt={item.label}
                fill
                sizes="(max-width: 768px) 50vw, 160px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="px-3 pb-3">
              <p className="text-xs font-semibold text-white">{item.label}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {['Design exclusivo', 'Modelagem premium', 'Estilo urbano/tech', 'Marca independente'].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-brand/20 bg-brand/[0.08] px-2.5 py-1 text-[11px] font-medium text-brand/80"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Block 2: Payment & Security ─────────────────────────────────────────────

// Card de crédito: sem arquivo local disponível → SVG inline limpo e semântico
function CreditCardIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-7 w-7"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="7" width="28" height="18" rx="3" fill="#1e40af" />
      <rect x="2" y="13" width="28" height="5" fill="#1d4ed8" />
      <rect x="6" y="18" width="8" height="3" rx="1" fill="#93c5fd" opacity=".7" />
      <rect x="2" y="7" width="28" height="18" rx="3" stroke="#3b82f6" strokeWidth="1" />
    </svg>
  );
}

const PAYMENT_METHODS = [
  {
    name: 'Pix',
    detail: 'Aprovação instantânea',
    localIcon: '/images/icons/pix.png',
    accent: 'border-emerald-500/25 bg-emerald-500/[0.07]',
    badge: 'bg-emerald-500/15 text-emerald-400',
    badgeLabel: 'Instantâneo',
  },
  {
    name: 'Cartão de Crédito',
    detail: 'Parcelado em até 12×',
    localIcon: null, // no local file — uses CreditCardIcon SVG
    accent: 'border-blue-500/25 bg-blue-500/[0.07]',
    badge: 'bg-blue-500/15 text-blue-400',
    badgeLabel: 'Parcelado',
  },
  {
    name: 'Mercado Pago',
    detail: 'Checkout seguro',
    localIcon: '/images/icons/Mercadopago.png',
    accent: 'border-sky-500/25 bg-sky-500/[0.07]',
    badge: 'bg-sky-500/15 text-sky-400',
    badgeLabel: 'Seguro',
  },
  {
    name: 'PayPal',
    detail: 'Proteção ao comprador',
    localIcon: '/images/icons/PayPal.png',
    accent: 'border-indigo-500/25 bg-indigo-500/[0.07]',
    badge: 'bg-indigo-500/15 text-indigo-400',
    badgeLabel: 'Protegido',
  },
] as const;

function PaymentBlock() {
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
        {PAYMENT_METHODS.map((m) => (
          <div
            key={m.name}
            className={`group flex flex-col gap-3 rounded-xl border p-3.5 transition-all duration-300 hover:shadow-[0_0_16px_rgba(249,115,22,0.06)] ${m.accent}`}
          >
            {/* Icon row */}
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/30">
                {m.localIcon ? (
                  <Image
                    src={m.localIcon}
                    alt={m.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                ) : (
                  <CreditCardIcon />
                )}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.badge}`}>
                {m.badgeLabel}
              </span>
            </div>

            {/* Labels */}
            <div>
              <p className="text-xs font-semibold text-white">{m.name}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">{m.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Security note */}
      <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-brand"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p className="text-[11px] leading-relaxed text-zinc-400">
          Todos os pagamentos são processados com criptografia de ponta a ponta. Seus dados
          financeiros nunca são armazenados em nossos servidores.
        </p>
      </div>
    </div>
  );
}

// ─── Block 3: Transparency ────────────────────────────────────────────────────

const TRANSPARENCY_POINTS = [
  {
    icon: '🎨',
    title: 'Imagens ilustrativas',
    desc: 'As fotos representam o design e a identidade visual da marca. São criadas para demonstrar o conceito.',
  },
  {
    icon: '💝',
    title: 'Apoio simbólico',
    desc: 'O valor pago funciona como contribuição voluntária ao projeto CAFÉ STORE, não como compra de produto físico.',
  },
  {
    icon: '📦',
    title: 'Sem envio físico',
    desc: 'Não há entrega de mercadoria. Ao concluir o apoio, você recebe uma confirmação digital da sua contribuição.',
  },
] as const;

function TransparencyBlock() {
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
        {TRANSPARENCY_POINTS.map((p) => (
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
          <span className="font-semibold text-brand">Dúvidas?</span> Entre em contato pelo WhatsApp
          ou acesse nossa{' '}
          <a
            href="/politica-de-privacidade"
            className="underline underline-offset-2 transition hover:text-brand"
          >
            Política de Privacidade
          </a>{' '}
          e{' '}
          <a
            href="/termos-de-uso"
            className="underline underline-offset-2 transition hover:text-brand"
          >
            Termos de Uso
          </a>
          .
        </p>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

const BLOCKS = [
  <BrandBlock key="brand" />,
  <PaymentBlock key="payment" />,
  <TransparencyBlock key="transparency" />,
];

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
        {BLOCKS.map((block, i) => (
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
