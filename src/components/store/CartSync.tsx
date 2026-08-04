'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';

export function CartSync() {
  const { data: session } = useSession();
  const fetchFromBackend = useCartStore((s) => s.fetchFromBackend);
  const syncWithBackend = useCartStore((s) => s.syncWithBackend);

  useEffect(() => {
    if (session?.user?.id) {
      // The server is authoritative for signed-in carts. Merging here used to
      // resurrect entries that had just been removed in another tab/session.
      fetchFromBackend(false);
    }
  }, [session?.user?.id, fetchFromBackend]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const interval = setInterval(() => syncWithBackend(), 30000);
    return () => clearInterval(interval);
  }, [session?.user?.id, syncWithBackend]);

  return null;
}
