'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';

export function CartCount() {
  const count = useCartStore((state) => state.count);
  const lastAddedAt = useCartStore((state) => state.lastAddedAt);
  const [mounted, setMounted] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!lastAddedAt) return;
    setBump(true);
    const timeout = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(timeout);
  }, [lastAddedAt]);

  return (
    <Link
      href="/cart"
      className={cn(
        'relative cursor-pointer text-zinc-400 transition-colors duration-200 hover:text-white',
        bump && 'animate-[cartBump_0.45s_ease-out]',
      )}
      aria-label="Abrir carrinho"
    >
      <ShoppingBag className="h-5 w-5" />
      <span
        className={cn(
          'absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-glow-sm',
          (mounted ? count : 0) > 0 ? 'animate-pulse-led' : 'animate-bounce-badge',
        )}
      >
        {mounted ? count : 0}
      </span>
    </Link>
  );
}
