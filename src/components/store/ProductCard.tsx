'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Check, Heart, Loader2, ShoppingCart, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductListItem } from '@/lib/products';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: ProductListItem;
  index?: number;
  isFavorited?: boolean;
  onCartOpen?: () => void;
};

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProductCard({ product, index = 0, isFavorited = false, onCartOpen }: ProductCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFav, setIsFav] = useState(isFavorited);
  const [loading, setLoading] = useState(false);
  const [favAnim, setFavAnim] = useState(false);
  const [clickAnim, setClickAnim] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  const image = product.images[0] ?? '/placeholder-product.svg';
  const inStock = product.stock > 0;
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.oldPrice!) * 100) : 0;
  const lowStock = inStock && product.stock < 5;
  const isInCart = cartItems.some((item) => item.productId === product.id);

  async function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.id) {
      router.push('/login?redirect=/products');
      return;
    }
    setLoading(true);
    const method = isFav ? 'DELETE' : 'POST';
    try {
      const res = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) {
        setIsFav(!isFav);
        if (!isFav) {
          setFavAnim(true);
          setTimeout(() => setFavAnim(false), 600);
        }
      }
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || addingToCart || justAdded || isInCart) return;
    setAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    useCartStore.getState().addItem({
      id: product.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image,
      quantity: 1,
    });
    setAddingToCart(false);
    setJustAdded(true);
    setClickAnim(true);
    setTimeout(() => setClickAnim(false), 300);
    setTimeout(() => setJustAdded(false), 2500);
  }

  return (
    <article
      className={cn(
        'group relative flex h-full animate-fade-up flex-col overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/80 opacity-0 shadow-[0_16px_48px_rgba(0,0,0,0.34)] backdrop-blur-xl transition-all duration-200 ease-out',
        inStock
          ? 'hover:-translate-y-2 hover:border-orange-400/35 hover:bg-zinc-900/95 hover:shadow-[0_24px_80px_rgba(0,0,0,0.4)]'
          : 'border-zinc-800/70 bg-zinc-950/55 opacity-75',
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      <div className="pointer-events-none absolute -inset-1 rounded-[28px] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/5" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[24px] bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-60" />

      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden rounded-t-[24px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(249,115,22,0.18),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015))]" />
        <div className="absolute inset-x-6 bottom-3 h-10 rounded-full bg-black/50 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
        <div className={cn('absolute inset-0 z-10 bg-black/50 transition-opacity duration-300', inStock ? 'opacity-0' : 'opacity-45')} />
        <div className="relative mx-auto flex min-h-[220px] w-full items-center justify-center bg-black/20 p-3 sm:min-h-[250px] sm:p-4 md:min-h-[270px] md:p-5">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              'h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]',
              inStock ? '' : 'grayscale',
            )}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-2">
          {!inStock ? (
            <span className="rounded-full border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400 shadow-[0_0_18px_rgba(239,68,68,0.16)] backdrop-blur-sm">
              Esgotado
            </span>
          ) : null}
          {product.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/35 bg-orange-500/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-300 shadow-[0_0_18px_rgba(249,115,22,0.18)] backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Destaque
            </span>
          ) : null}
          {hasDiscount ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_18px_rgba(255,255,255,0.08)] backdrop-blur-sm">
              <Zap className="h-3 w-3" />
              -{discountPercent}%
            </span>
          ) : null}
          {lowStock ? (
            <span className="rounded-full border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400 backdrop-blur-sm">
              Últimas {product.stock}
            </span>
          ) : null}
        </div>

        <div className="absolute right-3 top-3 z-10">
          <motion.button
            type="button"
            whileTap={{ scale: 0.8 }}
            animate={favAnim ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            disabled={loading}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-zinc-950/80 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-orange-400/35 hover:bg-zinc-900/90 active:scale-95',
              isFav && 'hover:border-orange-500/40',
            )}
            aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onClick={handleToggleFavorite}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isFav ? 'filled' : 'outline'}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Heart
                  className={cn(
                    'h-4.5 w-4.5 transition-colors',
                    isFav
                      ? 'fill-orange-500 text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]'
                      : 'text-white/70',
                  )}
                />
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="mb-1.5 truncate text-[11px] font-medium uppercase tracking-[0.24em] text-white/45">
          {product.category.name}
        </span>

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.8rem] text-[16px] font-semibold leading-snug text-white transition-colors duration-200 group-hover:text-orange-300 sm:text-[17px]">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-[12px] text-white/40">Apoio simbólico</p>

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <span className="text-[20px] font-black tracking-tight text-white transition-all duration-200 group-hover:text-orange-300 sm:text-[22px]">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-white/40 line-through">
              {formatPrice(product.oldPrice!)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-5">
          {isInCart ? (
            <Link
              href="/cart"
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-green-500/25 bg-green-500/10 px-4 py-3.5 text-sm font-bold text-green-200 shadow-[0_0_22px_rgba(34,197,94,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:border-green-400/50 hover:bg-green-500/15"
            >
              <Check className="h-4 w-4" />
              <span>No carrinho → Ver</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart || justAdded}
              className={cn(
                'relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 py-3.5 text-sm font-bold transition-all duration-300 ease-in-out hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed',
                justAdded
                  ? 'border-green-500/30 bg-green-500/15 text-green-100 shadow-[0_0_22px_rgba(34,197,94,0.14)]'
                  : inStock
                    ? 'border-orange-500/30 bg-orange-500/15 text-orange-100 shadow-[0_0_22px_rgba(249,115,22,0.12)] hover:border-orange-400/60 hover:bg-orange-500/25 hover:brightness-110 hover:shadow-[0_0_34px_rgba(249,115,22,0.22)]'
                    : 'cursor-default border border-zinc-800 bg-zinc-900 text-zinc-600',
                clickAnim && 'scale-95',
              )}
            >
              {addingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : justAdded ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShoppingCart className={cn('h-4 w-4 transition-transform', clickAnim && 'animate-bounce')} />
              )}
              <span>{addingToCart ? 'Adicionando...' : justAdded ? 'Adicionado!' : inStock ? 'Apoiar projeto' : 'Indisponível'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
