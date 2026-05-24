'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { User, Package, Heart, MapPin, Tag, Lock, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

const links = [
  { href: '/perfil', label: 'Meu Perfil', icon: User },
  { href: '/perfil/pedidos', label: 'Meus Pedidos', icon: Package },
  { href: '/perfil/favoritos', label: 'Favoritos', icon: Heart },
  { href: '/perfil/enderecos', label: 'Endereços', icon: MapPin },
  { href: '/perfil/cupons', label: 'Cupons', icon: Tag },
  { href: '/perfil/seguranca', label: 'Segurança', icon: Lock },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { data: session } = useSession();

  function isActive(link: (typeof links)[number]) {
    if (link.href === '/perfil') return pathname === '/perfil';
    return pathname === link.href || pathname.startsWith(link.href + '/');
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <>
      <aside className="w-full shrink-0 animate-slide-in-left lg:w-56">
        <div className="sticky top-24 flex flex-col gap-1 rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-2 backdrop-blur">
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
                    ? 'bg-brand text-white shadow-[0_0_14px_rgba(249,115,22,0.35)]'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}

          {isAdmin ? (
            <Link
              href="/admin/dashboard"
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
              )}
            >
              <Shield className="size-4 shrink-0" />
              Admin
            </Link>
          ) : null}

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

          {isAdmin ? (
            <Link
              href="/admin/dashboard"
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
            >
              <Shield className="size-3.5" />
              Admin
            </Link>
          ) : null}

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
