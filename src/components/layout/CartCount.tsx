'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
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
      className="relative grid size-9 place-items-center rounded-button text-text-muted transition hover:bg-white/5 hover:text-text-primary"
      aria-label="Abrir carrinho"
    >
      <ShoppingBag className="h-5 w-5" />
      <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-cafe-red-500 px-1 text-[10px] font-bold leading-4 text-white">
        {mounted ? count : 0}
      </span>
    </Link>
  );
}
