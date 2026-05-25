'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingCart, Sparkles, Zap } from 'lucide-react';
import type { ProductListItem } from '@/lib/products';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';
import { showToast } from './Toast';

type ProductCardProps = {
  product: ProductListItem;
  index?: number;
  onCartOpen?: () => void;
};

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
        'group relative flex h-full animate-fade-up flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] opacity-0 shadow-[0_10px_35px_rgba(0,0,0,0.28)] backdrop-blur-md transition-all duration-300 ease-in-out',
        inStock
          ? 'hover:-translate-y-1 hover:scale-[1.015] hover:border-orange-400/35 hover:bg-white/[0.065] hover:shadow-[0_22px_70px_rgba(249,115,22,0.13)]'
          : 'border-zinc-800/70 bg-zinc-950/50 opacity-75',
        product.featured &&
          'shadow-[0_0_28px_rgba(255,122,0,0.13),0_10px_35px_rgba(0,0,0,0.32)]',
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {product.featured ? (
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-orange-500/35 via-red-500/10 to-transparent opacity-60" />
      ) : null}

      <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
        {!inStock ? (
          <span className="rounded-full border border-zinc-700 bg-zinc-950/85 px-3 py-1 text-[11px] font-semibold text-zinc-400 backdrop-blur-md">Esgotado</span>
        ) : null}
        {product.featured ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-300/25 bg-yellow-300/15 px-3 py-1 text-[11px] font-bold text-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.16)] backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            Destaque
          </span>
        ) : null}
        {hasDiscount ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-400/25 bg-red-500/15 px-3 py-1 text-[11px] font-bold text-red-200 shadow-[0_0_18px_rgba(239,68,68,0.16)] backdrop-blur-md">
            <Zap className="h-3 w-3" />
            -{discountPercent}%
          </span>
        ) : null}
        {lowStock ? (
          <span className="rounded-full border border-orange-400/20 bg-orange-500/15 px-3 py-1 text-[11px] font-semibold text-orange-200 backdrop-blur-md">Últimas {product.stock}</span>
        ) : null}
      </div>

      <button
        type="button"
        className={cn(
          'absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full border bg-black/45 text-zinc-500 backdrop-blur-md transition-all duration-200 hover:scale-110',
          favorite
            ? 'scale-110 border-brand/60 bg-brand/15 text-brand shadow-[0_0_16px_rgba(255,122,0,0.35)]'
            : 'border-glass-border hover:border-brand/40 hover:text-brand',
        )}
        aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        onClick={handleFavorite}
      >
        <Heart className={cn('h-4 w-4 transition-transform', favorite && 'scale-110 fill-brand stroke-brand')} />
      </button>

      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(249,115,22,0.18),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015))]" />
        <div className="absolute inset-x-6 bottom-3 h-10 rounded-full bg-black/45 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
        <div className={cn('absolute inset-0 z-10 bg-black/50 transition-opacity duration-300', inStock ? 'opacity-0' : 'opacity-45')} />
        <div className="relative mx-auto flex aspect-[4/3] w-full items-center justify-center p-5 sm:p-6">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              'object-contain p-5 transition-transform duration-500 ease-in-out sm:p-6',
              inStock ? 'group-hover:scale-[1.04]' : 'grayscale',
            )}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300/85">{product.category.name}</span>
          {product.reviewCount > 0 ? (
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-yellow-200">
              ★ {product.averageRating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-bold leading-snug text-white transition-colors duration-200 group-hover:text-orange-200">{product.name}</h3>
        </Link>

        {product.reviewCount > 0 ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="flex items-center gap-0.5 text-[#FFD000]">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < Math.round(product.averageRating) ? '\u2605' : '\u2606'}</span>
              ))}
            </span>
            <span className="text-zinc-600">({product.reviewCount})</span>
          </div>
        ) : null}

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-zinc-500">Apoio simbólico</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="text-xl font-black tracking-tight text-white transition-all duration-200 group-hover:text-orange-200">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                {hasDiscount ? (
                  <span className="text-sm text-zinc-600 line-through">
              {product.oldPrice!.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={cn(
              'relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 py-3 text-sm font-black transition-all duration-300 ease-in-out active:scale-[0.97]',
              inStock
                ? 'border-orange-400/35 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-400/20 text-orange-100 shadow-[0_0_22px_rgba(249,115,22,0.12)] before:absolute before:inset-y-0 before:-left-1/3 before:w-1/3 before:skew-x-[-18deg] before:bg-white/20 before:opacity-0 before:transition-all before:duration-500 hover:border-orange-300/60 hover:from-red-500/35 hover:via-orange-500/35 hover:to-yellow-400/30 hover:shadow-[0_0_34px_rgba(249,115,22,0.22)] hover:before:left-[120%] hover:before:opacity-100'
                : 'cursor-default border border-zinc-800 bg-zinc-900 text-zinc-600',
              clickAnim && 'scale-95',
            )}
          >
            <ShoppingCart className={cn('relative h-4 w-4 transition-transform', clickAnim && 'animate-bounce')} />
            <span className="relative">{inStock ? 'Apoiar projeto' : 'Indisponível'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
