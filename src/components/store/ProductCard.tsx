'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import type { ProductListItem } from '@/lib/products';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';
import { showToast } from './Toast';

type ProductCardProps = {
  product: ProductListItem;
  index?: number;
  onCartOpen?: () => void;
};

function isNew(createdAt?: string) {
  if (!createdAt) return false;
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}

export function ProductCard({ product, index = 0, onCartOpen }: ProductCardProps) {
  const [favorite, setFavorite] = useState(false);
  const [clickAnim, setClickAnim] = useState(false);
  const image = product.images[0] ?? '/placeholder-product.svg';
  const inStock = product.stock > 0;
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.oldPrice!) * 100) : 0;
  const lowStock = inStock && product.stock < 5;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    useCartStore.getState().addItem({
      id: product.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image,
      quantity: 1,
    });
    showToast({
      message: `${product.name} adicionado como apoio simbolico.`,
      action: { label: 'Ver carrinho', onClick: () => onCartOpen?.() },
    });
    setClickAnim(true);
    setTimeout(() => setClickAnim(false), 300);
  }

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavorite((v) => !v);
  }

  return (
    <article
      className={cn(
        'group relative animate-fade-up rounded-2xl border opacity-0 backdrop-blur transition-all duration-300 ease-smooth',
        inStock
          ? 'glass-card-hover border-glass-border'
          : 'border-zinc-800/50 bg-glass-dark backdrop-blur-md',
        product.featured &&
          'shadow-[0_0_20px_rgba(255,122,0,0.15)]',
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      {/* feature glow border */}
      {product.featured ? (
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-brand/60 via-brand/20 to-transparent opacity-50" />
      ) : null}

      {/* badges */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
        {!inStock ? (
          <span className="rounded-full bg-zinc-800/90 px-3 py-1 text-[11px] font-semibold text-zinc-400 backdrop-blur-sm">Esgotado</span>
        ) : null}
        {inStock && isNew() ? (
          <span className="rounded-full bg-brand/15 px-3 py-1 text-[11px] font-semibold text-brand backdrop-blur-sm">Novo</span>
        ) : null}
        {product.featured ? (
          <span className="rounded-full bg-[#FFD000]/15 px-3 py-1 text-[11px] font-semibold text-[#FFD000] backdrop-blur-sm">Destaque</span>
        ) : null}
        {hasDiscount ? (
          <span className="rounded-full bg-[#FF3C38]/15 px-3 py-1 text-[11px] font-semibold text-[#FF3C38] backdrop-blur-sm">-{discountPercent}%</span>
        ) : null}
        {lowStock ? (
          <span className="rounded-full bg-[#FF3C38]/10 px-3 py-1 text-[11px] font-semibold text-[#FF3C38] backdrop-blur-sm">Últimas {product.stock}</span>
        ) : null}
      </div>

      {/* favorite */}
      <button
        type="button"
        className={cn(
          'absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full border bg-black/40 text-zinc-500 backdrop-blur-sm transition-all duration-200',
          favorite
            ? 'scale-110 border-brand/60 bg-brand/15 text-brand shadow-[0_0_16px_rgba(255,122,0,0.35)]'
            : 'border-glass-border hover:border-brand/40 hover:text-brand',
        )}
        aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        onClick={handleFavorite}
      >
        <Heart className={cn('h-4 w-4 transition-transform', favorite && 'scale-110 fill-brand stroke-brand')} />
      </button>

      {/* image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-t-2xl bg-zinc-900">
        <div className={cn('absolute inset-0 bg-black/50 transition-opacity duration-300', inStock ? 'opacity-0' : 'opacity-50')} />
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={cn(
            'h-full w-full object-cover transition-transform duration-500 ease-smooth',
            inStock ? 'group-hover:scale-110' : '',
          )}
        />
      </Link>

      {/* info */}
      <div className="flex flex-col gap-1.5 p-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-brand/80">{product.category.name}</span>
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors duration-200 group-hover:text-brand/80">{product.name}</h3>
        </Link>

        {/* ratings */}
        {product.reviewCount > 0 ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="flex items-center gap-0.5 text-[#FFD000]">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < Math.round(product.averageRating) ? '\u2605' : '\u2606'}</span>
              ))}
            </span>
            <span className="text-zinc-600">({product.reviewCount})</span>
          </div>
        ) : null}

        {/* price with LED on hover */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          {hasDiscount ? (
            <span className="text-sm text-zinc-600 line-through">
              {product.oldPrice!.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          ) : null}
        </div>

        {/* add to cart */}
        <div className={cn(
          'mt-2 transition-all duration-300',
          inStock ? 'translate-y-0 opacity-100' : '',
        )}>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={cn(
              'glass-button flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold',
              inStock
                ? 'bg-brand/10 text-brand border border-brand/30 hover:bg-brand/20 shadow-led-brand/30 hover:shadow-[0_0_20px_rgba(255,122,0,0.15)]'
                : 'cursor-default border border-zinc-800 bg-zinc-900 text-zinc-600',
              clickAnim && 'scale-95',
            )}
          >
            <ShoppingCart className={cn('h-4 w-4 transition-transform', clickAnim && 'animate-bounce')} />
            {inStock ? '+ Apoiar projeto' : 'Indisponível'}
          </button>
        </div>
      </div>
    </article>
  );
}
