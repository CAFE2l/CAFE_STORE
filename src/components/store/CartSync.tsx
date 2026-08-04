'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cart';

export function CartSync() {
  const { data: session } = useSession();
  const fetchFromBackend = useCartStore((s) => s.fetchFromBackend);
  const syncWithBackend = useCartStore((s) => s.syncWithBackend);
  const isHydrated = useCartStore((s) => s.isHydrated);
  const items = useCartStore((s) => s.items);
  // Track whether we've already synced for this session to avoid re-running
  // on unrelated re-renders.
  const syncedForSession = useRef<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!isHydrated || !userId || syncedForSession.current === userId) return;
    syncedForSession.current = userId;

    if (items.length > 0) {
      // User has local items pre-login — push them to the server so they are
      // not lost, then let the server response become the canonical state.
      void syncWithBackend();
    } else {
      // Local cart is empty — safe to pull the server cart without risk of
      // overwriting anything the user added before logging in.
      void fetchFromBackend();
    }
  }, [isHydrated, session?.user?.id, items.length, fetchFromBackend, syncWithBackend]);

  return null;
}
