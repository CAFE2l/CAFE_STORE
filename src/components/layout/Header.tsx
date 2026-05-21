import Link from 'next/link';
import { auth } from '@/lib/auth';
import { AuthMenu } from '@/components/layout/AuthMenu';
import { CartCount } from '@/components/layout/CartCount';

const navItems = [
  { href: '/products', label: 'Produtos' },
  { href: '/services', label: 'Servicos' },
  { href: '/orders', label: 'Pedidos' },
];

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background-base/80 backdrop-blur-xl">
      <div className="container-page flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl font-semibold text-text-primary">
          Cafe Store
        </Link>
        <nav className="hidden items-center gap-2 md:flex" aria-label="Navegacao principal">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="btn-ghost text-sm">
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
  );
}
