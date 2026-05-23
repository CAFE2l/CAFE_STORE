'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User, Package, Heart, MapPin, Tag, Lock, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

const links = [
  { href: '/profile', label: 'Meu Perfil', icon: User, matchExact: true },
  { href: '/orders', label: 'Meus Pedidos', icon: Package },
  { href: '/profile?section=favoritos', label: 'Favoritos', icon: Heart },
  { href: '/profile?section=enderecos', label: 'Endereços', icon: MapPin },
  { href: '/profile?section=cupons', label: 'Cupons', icon: Tag },
  { href: '/profile?section=seguranca', label: 'Segurança', icon: Lock },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = searchParams.get('section');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function isActive(link: (typeof links)[number]) {
    if (link.matchExact) return pathname === link.href;
    if (link.href.includes('section=')) {
      const linkSection = link.href.split('section=')[1];
      return pathname === '/profile' && section === linkSection;
    }
    return pathname === link.href || pathname.startsWith(link.href + '/');
  }

  return (
    <>
      <aside className="w-full shrink-0 animate-slide-in-left lg:w-56">
        <div className="sticky top-28 flex flex-col gap-1 rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-2 backdrop-blur">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-brand/15 text-brand ring-1 ring-brand/30'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
          <hr className="my-1 border-white/[0.06]" />
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="size-4 shrink-0" />
            Sair
          </button>
        </div>

        {/* Mobile: horizontal scroll tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-medium transition-all',
                  active
                    ? 'bg-brand/15 text-brand'
                    : 'bg-zinc-900/60 text-zinc-500 hover:text-zinc-300',
                )}
              >
                <Icon className="size-3.5" />
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="size-3.5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/[0.06] bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Sair da conta</h3>
            <p className="mt-2 text-sm text-zinc-400">Tem certeza que deseja sair da sua conta?</p>
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setShowLogoutConfirm(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
