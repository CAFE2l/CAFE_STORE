'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, type ReactNode } from 'react';
import { CartSync } from '@/components/store/CartSync';
import { CartToast } from '@/components/ui/CartToast';
import { useCartStore } from '@/store/cart';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const cartToastItem = useCartStore((state) => state.cartToastItem);
  const clearCartToast = useCartStore((state) => state.clearCartToast);

  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return (
    <SessionProvider>
      {children}
      <CartSync />
      <CartToast item={cartToastItem} onClose={clearCartToast} />
    </SessionProvider>
  );
}
