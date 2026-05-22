'use client';

import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';

type AuthMenuProps = {
  user:
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
      }
    | undefined;
};

export function AuthMenu({ user }: AuthMenuProps) {
  if (!user) {
    return (
      <Link href="/login" className="btn-primary h-9 px-4 text-sm">
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-button border border-border-subtle px-2.5 py-1.5 text-sm text-text-secondary transition hover:border-cafe-orange-500/40 hover:text-text-primary"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? 'Perfil do usuário'}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : (
          <span className="flex size-6 items-center justify-center rounded-full bg-cafe-orange-500/15 text-[10px] font-semibold text-cafe-orange-500">
            {(user.name ?? user.email ?? 'U').slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-24 truncate md:inline">{user.name ?? user.email}</span>
      </Link>
      <button
        type="button"
        className="grid size-8 place-items-center rounded-button text-text-muted transition hover:bg-white/5 hover:text-cafe-red-500"
        aria-label="Sair"
        onClick={() => {
          void signOut({ callbackUrl: '/' });
        }}
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
