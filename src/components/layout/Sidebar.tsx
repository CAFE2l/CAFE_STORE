'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, LayoutDashboard, Package, ShoppingCart, Users, Tag, Star, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/categories', label: 'Categorias', icon: Tag },
  { href: '/admin/reviews', label: 'Avaliações', icon: Star },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 border-r border-border-subtle bg-cafe-dark-900 p-5 lg:block">
      <Link href="/admin/dashboard" className="flex items-center gap-2 font-display text-lg font-bold">
        <Flame className="h-5 w-5 text-cafe-orange-500" />
        <span className="text-gradient-fire">CAFÉ Admin</span>
      </Link>
      <nav className="mt-8 grid gap-1" aria-label="Navegação administrativa">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-button px-4 py-2.5 text-sm font-medium transition duration-200',
                isActive
                  ? 'bg-cafe-red-500/10 text-cafe-red-500'
                  : 'text-text-secondary hover:bg-cafe-dark-700 hover:text-text-primary',
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="mt-8 flex items-center gap-2 rounded-button px-4 py-2.5 text-sm font-medium text-text-muted transition hover:bg-cafe-dark-700 hover:text-cafe-orange-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para loja
      </Link>
    </aside>
  );
}
