'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';
import { CartSync } from '@/components/store/CartSync';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <CartSync />
    </SessionProvider>
  );
}
