"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Flame, Mail, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { communityLinks, TELEGRAM_VIP_WHATSAPP } from "@/lib/community-links";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { socialLinks } from "@/lib/social-links";

const footerLinks = {
  loja: [
    { label: "Apoios", href: "/products" },
    { label: "Serviços", href: "/servicos" },
    { label: "Pedidos", href: "/orders" },
    {
      label: "Portfólio",
      href: "https://main-portfolio-sigma-flame.vercel.app/",
      external: true,
    },
    {
      label: "Landing Page",
      href: "https://e-commerce-landing-page-lime.vercel.app/",
      external: true,
    },
    {
      label: "Linktree",
      href: "https://personal-link-tree-livid.vercel.app/",
      external: true,
    },
  ],

  comunidade: [
    { label: "Discord", href: communityLinks.discord, external: true },
    { label: "Telegram VIP", href: TELEGRAM_VIP_WHATSAPP, external: true },
  ],
};

const socialLinksList: {
  platform: "discord" | "telegram" | "twitter" | "linkedin" | "youtube";
  href: string;
  label: string;
}[] = [
  { platform: "discord", href: socialLinks.discord, label: "Discord" },
  { platform: "telegram", href: socialLinks.telegram, label: "Telegram" },
  { platform: "twitter", href: socialLinks.twitter, label: "Twitter/X" },
  { platform: "linkedin", href: socialLinks.linkedin, label: "LinkedIn" },
  { platform: "youtube", href: socialLinks.youtube, label: "YouTube" },
];

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  const cls =
    "group/link relative inline-flex items-center gap-1.5 overflow-hidden py-1 text-sm text-[#AAAAAA] no-underline transition-colors duration-150 hover:text-white";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        <span className="translate-x-0 transition-transform duration-200 group-hover/link:translate-x-1.5">
          {children}
        </span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      <span className="translate-x-0 transition-transform duration-200 group-hover/link:translate-x-1.5">
        {children}
      </span>
    </Link>
  );
}

function ColumnLinks({
  title,
  links,
}: {
  title: string;
  links: typeof footerLinks.loja;
}) {
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
            "size-4 transition-transform duration-300 sm:hidden",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-350 max-sm:overflow-hidden",
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 sm:grid-rows-[1fr] sm:opacity-100",
        )}
      >
        <div className="min-h-0">
          <div className="mt-5 grid gap-0.5">
            {links.map((link) => (
              <FooterLink
                key={link.label}
                href={link.href}
                external={link.external}
              >
                {link.label}
              </FooterLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialIconButton({
  platform,
  href,
  label,
}: {
  platform: "discord" | "telegram" | "twitter" | "linkedin" | "youtube";
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex size-[38px] items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B00] hover:bg-[rgba(255,107,0,0.08)] hover:shadow-[0_4px_16px_rgba(255,107,0,0.15)]"
      aria-label={label}
    >
      <SocialIcon platform={platform} size={18} />
    </a>
  );
}

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    setIsOnline(day >= 1 && day <= 5 && hour >= 9 && hour < 18);
    setYear(now.getFullYear());
  }, []);

  return (
    <footer
      ref={footerRef}
      className={cn(visible && "footer-visible")}
      style={{ background: "#0A0A0A" }}
    >
      {/* Accent bar */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            "linear-gradient(90deg, #D92B2B 0%, #FF6B00 50%, #E8B800 100%)",
          transform: visible ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left center",
          transition:
            "transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms",
        }}
      />

      {/* Body */}
      <div
        className="mx-auto"
        style={{
          padding: "clamp(48px, 7vw, 80px) clamp(20px, 5vw, 80px)",
          maxWidth: "1280px",
        }}
      >
        <div
          className="grid grid-cols-1 max-lg:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr]"
          style={{
            gap: "clamp(32px,4vw,64px)",
            alignItems: "start",
          }}
        >
          {/* Col 1: Brand */}
          <div
            className="footer-col max-lg:col-span-full"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(32px)",
              transition:
                "opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms",
            }}
          >
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-2.5 no-underline"
              style={{ whiteSpace: "nowrap" }}
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#FF6B00]/15 text-[#FF6B00]">
                <Flame className="size-5" />
              </div>
              <span className="font-display text-lg font-bold tracking-wide text-white">
                CAFÉ STORE
              </span>
            </Link>
            <p className="mt-2 text-[13px] italic text-[#FF6B00]">
              CREATE BUILD INSPIRE
            </p>
            <p
              className="mt-4 text-[13px] leading-[1.65] text-[#AAAAAA]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              Criação de web-aplicações, agências digitais, sites e landing
              pages para você e seu negócio.
            </p>

            <div className="mt-6 flex gap-[10px]">
              {socialLinksList.map((social, i) => (
                <div
                  key={social.label}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "scale(1)" : "scale(0.7)",
                    transition: `opacity 300ms cubic-bezier(0.34, 1.56, 0.64, 1) ${400 + i * 60}ms, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1) ${400 + i * 60}ms`,
                  }}
                >
                  <SocialIconButton
                    platform={social.platform}
                    href={social.href}
                    label={social.label}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Loja */}
          <div
            className="footer-col"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(32px)",
              transition:
                "opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 180ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 180ms",
            }}
          >
            <ColumnLinks title="Loja" links={footerLinks.loja} />
          </div>

          {/* Col 3: Comunidade */}
          <div
            className="footer-col"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(32px)",
              transition:
                "opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 300ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 300ms",
            }}
          >
            <ColumnLinks title="Comunidade" links={footerLinks.comunidade} />
          </div>

          {/* Col 4: Suporte */}
          <div
            className="footer-col grid gap-6"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(32px)",
              transition:
                "opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 380ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 380ms",
            }}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#FF6B00]">
                Suporte
              </p>
              <div className="mt-5 grid gap-3">
                <a
                  href="mailto:gutiajs@gmail.com"
                  className="flex items-center gap-2.5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[#AAAAAA] no-underline backdrop-blur-[8px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_0_40px_rgba(255,107,0,0.04)]"
                >
                  <Mail className="size-4 shrink-0 text-[#FF6B00]" />
                  gutiajs@gmail.com
                </a>
                <a
                  href="https://wa.me/5541996713782"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[#AAAAAA] no-underline backdrop-blur-[8px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_0_40px_rgba(255,107,0,0.04)]"
                >
                  <WhatsappIcon className="size-4 shrink-0" />
                  +55 (41) 99671-3782
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
              <p className="text-sm font-semibold text-white">
                Receba novidades
              </p>
              <p className="mt-2 text-xs text-[#666666]">Em breve</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-auto h-px"
        style={{
          background: "rgba(255,255,255,0.07)",
          marginLeft: "clamp(20px, 5vw, 80px)",
          marginRight: "clamp(20px, 5vw, 80px)",
          transform: visible ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 600ms ease-out 400ms",
        }}
      />

      {/* Bottom bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        style={{
          padding: "20px clamp(20px, 5vw, 80px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 400ms ease-out 500ms",
        }}
      >
        <p className="whitespace-nowrap text-xs text-[#666666]">
          &copy; {year ?? ''} CAFÉ STORE &mdash; Todos os direitos
          reservados.
        </p>

        <p className="hidden text-[11px] text-white/25 md:block">
          As imagens são ilustrativas e não representam entrega física.
        </p>

        <div className="flex items-center gap-2 text-xs text-[#666666]">
          <Link
            href="/politica-de-privacidade"
            className="transition-colors duration-150 hover:text-white"
          >
            Política de privacidade
          </Link>
          <span>&middot;</span>
          <Link
            href="/termos-de-uso"
            className="transition-colors duration-150 hover:text-white"
          >
            Termos de uso
          </Link>
        </div>
      </div>
    </footer>
  );
}
