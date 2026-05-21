'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart';

export function CartCount() {
  const count = useCartStore((state) => state.count);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/cart"
      className="relative rounded-xl border border-white/10 px-3 py-2 text-sm text-text-secondary transition hover:border-accent-primary/40 hover:text-text-primary"
      aria-label="Abrir carrinho"
    >
      Carrinho
      <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-accent-primary px-1.5 text-xs font-semibold text-background-base">
        {mounted ? count : 0}
      </span>
    </Link>
  );
}
