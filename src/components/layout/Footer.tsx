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
      <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-4 max-h-[180px] py-4">
        {/* Left: logo + small tagline */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-3 text-white/70 font-semibold">
            <Flame className="h-6 w-6 text-cafe-orange-500" />
            <span className="text-white/70 font-display">CAFÉ STORE</span>
          </Link>
          <p className="text-[11px] text-white/25 sm:ml-2">As imagens são ilustrativas e não representam entrega física.</p>
        </div>

        {/* Center: main navigation links */}
        <nav className="flex flex-wrap justify-center gap-6">
          {centerLinks.map((link) => (
            link.external ? (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-brand transition text-sm">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="text-white/40 hover:text-brand transition text-sm">
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Right: copyright + small links */}
        <div className="flex flex-col items-end text-right gap-1">
          <div className="text-sm text-white/40">&copy; {new Date().getFullYear()} CAFÉ STORE</div>
          <div className="flex gap-3 text-xs">
            <Link href="/privacy" className="text-white/40 hover:text-brand transition">Política de privacidade</Link>
            <Link href="/terms" className="text-white/40 hover:text-brand transition">Termos de uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
