import Link from 'next/link';
import { Flame } from 'lucide-react';
import { auth } from '@/lib/auth';
import { AuthMenu } from '@/components/layout/AuthMenu';
import { CartCount } from '@/components/layout/CartCount';
import { MobileNav } from '@/components/layout/MobileNav';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';

const navItems = [
  { href: '/products', label: 'Produtos' },
  { href: '/products?category=caespeciais', label: 'Cafés Especiais' },
  { href: '/products?category=ofertas', label: 'Ofertas' },
  { href: '/orders', label: 'Pedidos' },
];

export async function Header() {
  const session = await auth();

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-cafe-dark-900/90 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <MobileNav navItems={navItems} />

          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-text-primary shrink-0">
            <Flame className="h-6 w-6 text-cafe-orange-500" />
            <span className="text-gradient-fire hidden sm:inline">CAFÉ Store</span>
            <span className="text-gradient-fire sm:hidden">CAFÉ</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-button px-3 py-2 text-sm font-medium text-text-secondary transition duration-200 hover:bg-white/5 hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <CartCount />
            <AuthMenu user={session?.user} />
          </div>
        </div>
      </header>
    </>
  );
}
