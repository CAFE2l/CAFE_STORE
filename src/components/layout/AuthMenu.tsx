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
      <Link
        href="/login"
        className="glass-button bg-brand hover:bg-brand-light text-white shadow-led-brand hover:shadow-[0_0_20px_4px_#F9731670,0_0_50px_8px_#F9731630] px-4 py-2 text-sm"
      >
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/profile"
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-glass-border bg-white/[0.04] backdrop-blur-sm px-3 py-1.5 text-sm transition-all duration-200 hover:border-brand/40 hover:bg-white/[0.08]"
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
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-glow-sm">
            {(user.name ?? user.email ?? 'U').slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-24 truncate md:inline text-zinc-400">{user.name ?? user.email}</span>
      </Link>
      <button
        type="button"
        className="cursor-pointer text-zinc-500 transition-colors duration-200 hover:text-brand"
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
