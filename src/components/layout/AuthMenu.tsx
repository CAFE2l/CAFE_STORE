'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { ProfileDropdown } from '@/components/ProfileDropdown';

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
    <ProfileDropdown
      userName={user.name ?? user.email ?? 'Usuário'}
      userEmail={user.email ?? undefined}
      avatarUrl={user.image ?? undefined}
      onLogout={() => {
        void signOut({ callbackUrl: '/' });
      }}
    />
  );
}
