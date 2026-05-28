import Link from "next/link";
import { Flame } from "lucide-react";

export function Footer() {
  const centerLinks = [
    { label: 'Apoios', href: '/products' },
    { label: 'Serviços', href: '/servicos' },
    { label: 'Pedidos', href: '/orders' },
    { label: 'Portfólio', href: 'https://main-portfolio-sigma-flame.vercel.app/', external: true },
    { label: 'Landing Page', href: 'https://e-commerce-landing-page-lime.vercel.app/', external: true },
    { label: 'Linktree', href: 'https://personal-link-tree-livid.vercel.app/', external: true },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-black/40 backdrop-blur-md">
      <div className="container-page flex flex-col items-start justify-between gap-6 py-6 sm:flex-row sm:items-center">
        {/* Left: logo + small tagline */}
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Link href="/" className="flex min-h-11 items-center gap-3 py-1 font-semibold text-white/70">
            <Flame className="h-6 w-6 text-cafe-orange-500" />
            <span className="text-white/70 font-display">CAFÉ STORE</span>
          </Link>
          <p className="text-sm leading-6 text-white/30 sm:ml-2">As imagens são ilustrativas e não representam entrega física.</p>
        </div>

        {/* Center: main navigation links */}
        <nav className="flex flex-wrap justify-start gap-x-5 gap-y-1 sm:justify-center">
          {centerLinks.map((link) => (
            link.external ? (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center py-2 text-sm text-white/40 transition hover:text-brand">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="inline-flex min-h-11 items-center py-2 text-sm text-white/40 transition hover:text-brand">
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Right: copyright + small links */}
        <div className="flex flex-col items-start gap-1 text-left sm:items-end sm:text-right">
          <div className="text-sm text-white/40">&copy; {new Date().getFullYear()} CAFÉ STORE</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <Link href="/politica-de-privacidade" className="inline-flex min-h-11 items-center text-white/40 transition hover:text-brand">Política de privacidade</Link>
            <Link href="/termos-de-uso" className="inline-flex min-h-11 items-center text-white/40 transition hover:text-brand">Termos de uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
