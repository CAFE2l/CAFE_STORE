'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Role } from '@prisma/client';
import { AuthMenu } from '@/components/layout/AuthMenu';
import { CartCount } from '@/components/layout/CartCount';
import { MobileNav } from '@/components/layout/MobileNav';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/products', label: 'Apoios' },
  { href: '/servicos', label: 'Serviços' },
  { href: '/orders', label: 'Pedidos' },
];

type HeaderClientProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: Role | null;
  } | undefined;
};

export function HeaderClient({ user }: HeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'glass-nav fixed left-0 right-0 top-0 z-50 px-6 py-4 transition-all duration-300',
        scrolled && 'bg-black/80 shadow-glass',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <MobileNav navItems={navItems} />

        <Link href="/" className="group flex shrink-0 items-center gap-3 text-xl font-bold">
          <div className="relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand/20 to-brand/5 ring-1 ring-brand/20 shadow-led-brand transition-all duration-500 group-hover:shadow-[0_0_12px_rgba(249,115,22,0.2)] group-hover:ring-brand/40 group-hover:scale-110">
            <Image src="/images/favicon.png" alt="CAFÉ STORE" width={36} height={36} className="size-[36px] rounded-full object-cover drop-shadow-[0_0_4px_rgba(249,115,22,0.3)] transition-transform duration-500 group-hover:rotate-[8deg]" />
          </div>
          <span className="hidden animate-glow-brand sm:inline text-gradient-fire">CAFÉ STORE</span>
          <span className="animate-glow-brand sm:hidden text-gradient-fire">CAFÉ</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-white after:absolute after:bottom-[-2px] after:left-0 after:h-[1.5px] after:w-0 after:bg-brand hover:after:w-full after:transition-all after:duration-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CartCount />
          <AuthMenu user={user} />
        </div>
      </div>
    </header>
  );
}
