'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Flame,
  Mail,
  MessageCircle,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const footerLinks = {
  loja: [
    { label: 'Apoios', href: '/products' },
    { label: 'Serviços', href: '/servicos' },
    { label: 'Pedidos', href: '/orders' },
    { label: 'Portfólio', href: 'https://main-portfolio-sigma-flame.vercel.app/', external: true },
    { label: 'Landing Page', href: 'https://e-commerce-landing-page-lime.vercel.app/', external: true },
    { label: 'Linktree', href: 'https://personal-link-tree-livid.vercel.app/', external: true },
  ],
  recursos: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Blog', href: '/blog' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Status do sistema', href: '/status' },
    { label: 'Documentação', href: '/docs' },
  ],
};

const socialIcons: { icon: (props: { size?: number }) => ReactNode; label: string }[] = [
  {
    icon: ({ size = 16 }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    label: 'Instagram',
  },
  {
    icon: ({ size = 16 }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    label: 'YouTube',
  },
  {
    icon: ({ size = 16 }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    label: 'Twitter/X',
  },
  {
    icon: ({ size = 16 }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    label: 'LinkedIn',
  },
];

function FooterLink({ href, external, children }: { href: string; external?: boolean; children: ReactNode }) {
  const cls = 'group/link relative inline-flex items-center gap-1.5 overflow-hidden py-1 text-sm text-[#AAAAAA] no-underline transition-colors duration-150 hover:text-white';
  const after = 'after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-[#FF6B00] after:transition-transform after:duration-200 hover:after:origin-left hover:after:scale-x-100';

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${cls} ${after}`}>
        <span className="translate-x-0 transition-transform duration-200 group-hover/link:translate-x-1.5">{children}</span>
      </a>
    );
  }
  return (
    <Link href={href} className={`${cls} ${after}`}>
      <span className="translate-x-0 transition-transform duration-200 group-hover/link:translate-x-1.5">{children}</span>
    </Link>
  );
}

function ColumnLinks({ title, links }: { title: string; links: typeof footerLinks.loja }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="footer-col">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-[#FF6B00] sm:cursor-default sm:pointer-events-none"
      >
        {title}
        <ChevronDown
          className={cn(
            'size-4 transition-transform duration-300 sm:hidden',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-350 max-sm:overflow-hidden',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 sm:grid-rows-[1fr] sm:opacity-100',
        )}
      >
        <div className="min-h-0">
          <div className="mt-5 grid gap-0.5">
            {links.map((link) => (
              <FooterLink key={link.label} href={link.href} external={link.external}>
                {link.label}
              </FooterLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialIcon({ icon, label }: { icon: (props: { size?: number }) => ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex size-[38px] items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] text-[#666666] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B00] hover:bg-[rgba(255,107,0,0.08)] hover:text-[#FF6B00] hover:shadow-[0_4px_16px_rgba(255,107,0,0.15)]"
      aria-label={label}
    >
      {icon({ size: 16 })}
    </button>
  );
}

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isOnline = day >= 1 && day <= 5 && hour >= 9 && hour < 18;

  async function handleNewsletter(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setNewsletterMsg('Obrigado por se inscrever!');
    setEmail('');
    setTimeout(() => setNewsletterMsg(''), 4000);
  }

  return (
    <footer
      ref={footerRef}
      className={cn(
        visible && 'footer-visible',
      )}
      style={{ background: '#0A0A0A' }}
    >
      {/* Accent bar */}
      <div
        className="h-[3px] w-full"
        style={{
          background: 'linear-gradient(90deg, #D92B2B 0%, #FF6B00 50%, #E8B800 100%)',
          transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left center',
          transition: 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms',
        }}
      />

      {/* Body */}
      <div
        className="mx-auto"
        style={{
          padding: 'clamp(48px, 7vw, 80px) clamp(20px, 5vw, 80px)',
          maxWidth: '1280px',
        }}
      >
        <div
          className="grid grid-cols-1 max-lg:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr]"
          style={{
            gap: 'clamp(32px,4vw,64px)',
            alignItems: 'start',
          }}
        >
          {/* Col 1: Brand */}
          <div
            className="footer-col max-lg:col-span-full"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(32px)',
              transition: 'opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms',
            }}
          >
            <Link href="/" className="inline-flex shrink-0 items-center gap-2.5 no-underline" style={{ whiteSpace: 'nowrap' }}>
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#FF6B00]/15 text-[#FF6B00]">
                <Flame className="size-5" />
              </div>
              <span className="font-display text-lg font-bold tracking-wide text-white">CAFÉ STORE</span>
            </Link>
            <p className="mt-2 text-[13px] italic text-[#FF6B00]">Dream. Build. Inspire.</p>
            <p className="mt-4 text-[13px] leading-[1.65] text-[#AAAAAA]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              Sua loja de café especial. Grãos selecionados, torra artesanal e entrega para todo o Brasil.
            </p>

            <div className="mt-6 flex gap-[10px]">
              {socialIcons.map((social, i) => (
                <div
                  key={social.label}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'scale(1)' : 'scale(0.7)',
                    transition: `opacity 300ms cubic-bezier(0.34, 1.56, 0.64, 1) ${400 + i * 60}ms, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1) ${400 + i * 60}ms`,
                  }}
                >
                  <SocialIcon icon={social.icon} label={social.label} />
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Loja */}
          <div
            className="footer-col"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(32px)',
              transition: 'opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 180ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 180ms',
            }}
          >
            <ColumnLinks title="Loja" links={footerLinks.loja} />
          </div>

          {/* Col 3: Recursos */}
          <div
            className="footer-col"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(32px)',
              transition: 'opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 260ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 260ms',
            }}
          >
            <ColumnLinks title="Recursos" links={footerLinks.recursos} />
          </div>

          {/* Col 4: Suporte */}
          <div
            className="footer-col grid gap-6"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(32px)',
              transition: 'opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 340ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 340ms',
            }}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#FF6B00]">Suporte</p>
              <div className="mt-5 grid gap-3">
                <a
                  href="mailto:contato@cafestore.com.br"
                  className="flex items-center gap-2.5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[#AAAAAA] no-underline backdrop-blur-[8px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_0_40px_rgba(255,107,0,0.04)]"
                >
                  <Mail className="size-4 shrink-0 text-[#FF6B00]" />
                  contato@cafestore.com.br
                </a>
                <a
                  href="https://wa.me/554199671XXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[#AAAAAA] no-underline backdrop-blur-[8px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_0_40px_rgba(255,107,0,0.04)]"
                >
                  <MessageCircle className="size-4 shrink-0 text-[#25D366]" />
                  (41) 99671-xxxx
                </a>
              </div>
              <p className="mt-2 text-xs text-[#666666]">Seg–Sex, 9h–18h</p>
              {isOnline ? (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
                  <span className="size-1.5 animate-pulse rounded-full bg-green-400" />
                  Online agora
                </div>
              ) : null}
            </div>

            {/* Newsletter */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4 backdrop-blur-[8px] transition-shadow duration-300 hover:shadow-[inset_0_0_40px_rgba(255,107,0,0.04)]">
              <p className="text-sm font-semibold text-white">Receba novidades</p>
              <form onSubmit={handleNewsletter} className="mt-3 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  aria-label="Email para newsletter"
                  className="min-w-0 flex-1 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-white outline-none placeholder:text-[#666666] transition-all duration-200 focus:border-[#FF6B00] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.12)]"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#FF6B00] px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#E55A00] active:scale-[0.97]"
                >
                  Entrar
                  <ArrowRight className="size-3.5" />
                </button>
              </form>
              {newsletterMsg ? (
                <p className="mt-2 text-xs text-green-400">{newsletterMsg}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-auto h-px"
        style={{
          background: 'rgba(255,255,255,0.07)',
          marginLeft: 'clamp(20px, 5vw, 80px)',
          marginRight: 'clamp(20px, 5vw, 80px)',
          transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 600ms ease-out 400ms',
        }}
      />

      {/* Bottom bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        style={{
          padding: '20px clamp(20px, 5vw, 80px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 400ms ease-out 500ms',
        }}
      >
        <p className="whitespace-nowrap text-xs text-[#666666]">
          &copy; {new Date().getFullYear()} CAFÉ STORE &mdash; Todos os direitos reservados.
        </p>

        <p className="hidden text-[11px] text-white/25 md:block">
          As imagens são ilustrativas e não representam entrega física.
        </p>

        <div className="flex items-center gap-2 text-xs text-[#666666]">
          <Link href="/politica-de-privacidade" className="transition-colors duration-150 hover:text-white">
            Política de privacidade
          </Link>
          <span>&middot;</span>
          <Link href="/termos-de-uso" className="transition-colors duration-150 hover:text-white">
            Termos de uso
          </Link>
        </div>
      </div>


    </footer>
  );
}
