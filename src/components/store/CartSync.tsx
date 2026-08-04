'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';

export function CartSync() {
  const { data: session } = useSession();
  const fetchFromBackend = useCartStore((s) => s.fetchFromBackend);

  useEffect(() => {
    if (session?.user?.id) {
      fetchFromBackend();
    }
  }, [session?.user?.id, fetchFromBackend]);

  return null;
}
