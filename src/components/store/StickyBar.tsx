'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import type { ProductDetail } from '@/lib/products';
import type { CartVariant } from '@/types';
import { cn } from '@/lib/utils';

type StickyBarProps = {
  product: ProductDetail;
  selectedVariants?: Record<string, string>;
  variantOptions?: { name: string; values: string[] }[];
};

export function StickyBar({ product, selectedVariants = {}, variantOptions = [] }: StickyBarProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(!e.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  function getCartVariants(): CartVariant[] {
    return Object.entries(selectedVariants)
      .filter(([, value]) => value)
      .map(([name, value]) => ({ name, value }));
  }

  function handleBuy() {
    const missing = variantOptions.find((v) => !selectedVariants[v.name]);
    if (missing) {
      setError(`Selecione ${missing.name.toLowerCase()} antes de apoiar.`);
      return;
    }
    setError(null);
    addItem({
      id: `${product.id}-${JSON.stringify(selectedVariants)}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? '/placeholder-product.svg',
      price: product.price,
      quantity: 1,
      stock: product.stock,
      variants: getCartVariants(),
    });
    router.push('/checkout');
  }

  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none absolute bottom-0 h-px" />
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-surface-1/80 px-6 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-500',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none',
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
              <Image src={product.images[0] ?? '/placeholder-product.svg'} alt="" fill sizes="40px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{product.name}</p>
              <p className="text-xs text-zinc-500">
                {product.reviewCount > 0 ? `★ ${product.averageRating.toFixed(1)}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden whitespace-nowrap text-lg font-bold text-brand sm:block">
              {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={handleBuy}
                className={cn(
                  'rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_16px_rgba(249,115,22,0.3)] transition-all hover:brightness-110 hover:shadow-[0_0_24px_rgba(249,115,22,0.5)] active:scale-95 disabled:opacity-50',
                  error ? 'bg-red-500' : 'bg-brand',
                )}
              >
                {product.stock > 0 ? 'Apoiar agora' : 'Indisponivel'}
              </button>
              {error ? <span className="text-[11px] font-medium text-red-400 whitespace-nowrap">{error}</span> : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
