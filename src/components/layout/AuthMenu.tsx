'use client';

import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

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
      <Link href="/login" className="btn-primary px-4 py-2 text-sm">
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1.5 text-sm text-text-secondary transition hover:border-accent-primary/40 hover:text-text-primary"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? 'Perfil do usuario'}
            width={28}
            height={28}
            className="rounded-full"
          />
        ) : (
          <span className="flex size-7 items-center justify-center rounded-full bg-accent-primary/15 text-xs font-semibold text-accent-primary">
            {(user.name ?? user.email ?? 'U').slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-32 truncate md:inline">{user.name ?? user.email}</span>
      </Link>
      <button
        type="button"
        className="btn-ghost text-sm"
        onClick={() => {
          void signOut({ callbackUrl: '/' });
        }}
      >
        Sair
      </button>
    </div>
  );
}
