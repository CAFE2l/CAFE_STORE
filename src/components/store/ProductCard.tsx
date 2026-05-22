'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PriceBlock } from '@/components/ui/PriceBlock';
import { useCartStore } from '@/store/cart';
import type { ProductListItem } from '@/lib/products';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: ProductListItem;
};

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const image = product.images[0] ?? '/placeholder-product.svg';
  const inStock = product.stock > 0;
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  function handleAddToCart() {
    addItem({
      id: product.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      price: product.price,
      quantity: 1,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-border-subtle bg-background-card transition-all duration-200 hover:-translate-y-1 hover:border-cafe-orange-500/40 hover:shadow-warm">
      {discount ? (
        <span className="absolute left-3 top-3 z-10 rounded-badge bg-cafe-yellow-500 px-2 py-0.5 text-xs font-bold text-cafe-dark-900">
          -{discount}%
        </span>
      ) : null}
      {!inStock ? (
        <span className="absolute left-3 top-3 z-10 rounded-badge bg-cafe-dark-600 px-2 py-0.5 text-xs font-medium text-cafe-gray-400">
          Esgotado
        </span>
      ) : null}
      <button
        type="button"
        className={cn(
          'absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full transition-all duration-200',
          favorite
            ? 'bg-cafe-red-500/15 text-cafe-red-500'
            : 'bg-cafe-dark-900/50 text-white/70 hover:bg-cafe-dark-900/80 hover:text-cafe-red-500',
        )}
        aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        onClick={() => setFavorite((current) => !current)}
      >
        <Heart className={cn('h-4 w-4', favorite && 'fill-current')} />
      </button>

      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-cafe-dark-700"
      >
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product.slug}`} className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold text-text-primary transition group-hover:text-cafe-orange-500">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-xs text-cafe-yellow-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>{i < 4 ? '★' : '☆'}</span>
          ))}
          <span className="ml-1 text-text-muted">(27)</span>
        </div>

        <PriceBlock price={product.price} oldPrice={product.oldPrice} className="mt-auto" />

        <Button
          className="mt-2 w-full h-10 text-sm"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          {added ? (
            <>✓ Adicionado</>
          ) : !inStock ? (
            'Indisponível'
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Adicionar
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
