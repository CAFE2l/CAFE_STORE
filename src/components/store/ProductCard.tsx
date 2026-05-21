'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PriceBlock } from '@/components/ui/PriceBlock';
import { useCartStore } from '@/store/cart';
import type { ProductListItem } from '@/lib/products';

type ProductCardProps = {
  product: ProductListItem;
};

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [favorite, setFavorite] = useState(false);
  const image = product.images[0] ?? '/placeholder-product.svg';
  const inStock = product.stock > 0;

  return (
    <article className="card group grid overflow-hidden p-0">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/3] overflow-hidden bg-background-surface"
      >
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3">
          <Badge variant={inStock ? 'success' : 'error'}>{inStock ? 'Em estoque' : 'Indisponivel'}</Badge>
        </span>
      </Link>
      <div className="grid gap-4 p-4">
        <div className="grid gap-2">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/products/${product.slug}`} className="min-w-0">
              <h2 className="line-clamp-2 text-base font-semibold text-text-primary transition group-hover:text-accent-glow">
                {product.name}
              </h2>
            </Link>
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 text-text-secondary transition hover:border-accent-primary/40 hover:text-accent-primary"
              aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onClick={() => setFavorite((current) => !current)}
            >
              {favorite ? '♥' : '♡'}
            </button>
          </div>
          <p className="line-clamp-2 min-h-10 text-sm leading-5 text-text-secondary">
            {product.description ?? 'Cafe premium selecionado para preparo especial.'}
          </p>
        </div>
        <PriceBlock price={product.price} oldPrice={product.oldPrice} />
        <Button
          className="w-full"
          disabled={!inStock}
          onClick={() =>
            addItem({
              id: product.id,
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image,
              price: product.price,
              quantity: 1,
              stock: product.stock,
            })
          }
        >
          {inStock ? 'Adicionar' : 'Sem estoque'}
        </Button>
      </div>
    </article>
  );
}
