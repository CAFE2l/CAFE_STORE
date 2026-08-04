'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import { EmptyPanel, SkeletonCards, currencyFormatter } from './shared';

type FavoriteProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  images: string[];
};

export function FavoritesPageClient() {
  const addItem = useCartStore((state) => state.addItem);
  const [items, setItems] = useState<FavoriteProduct[]>([]);
  const [removed, setRemoved] = useState<FavoriteProduct | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch('/api/user/favorites');
    const json = await response.json();
    setItems((json.data ?? []).map((item: { product: FavoriteProduct }) => item.product));
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(product: FavoriteProduct) {
    setItems((current) => current.filter((item) => item.id !== product.id));
    setRemoved(product);
    await fetch(`/api/user/favorites/${product.id}`, { method: 'DELETE' });
    setTimeout(() => setRemoved(null), 4000);
  }

  async function undo() {
    if (!removed) return;
    await fetch('/api/user/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: removed.id }),
    });
    setItems((current) => [removed, ...current]);
    setRemoved(null);
  }

  if (loading) return <SkeletonCards />;

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-bold text-white">Meus Favoritos</h2>
        <p className="mt-1 text-sm text-zinc-500">{items.length} produto(s) favoritado(s)</p>
      </div>
      {items.length === 0 ? (
        <EmptyPanel title="Sua lista de favoritos esta vazia" action={{ href: '/products', label: 'Explorar produtos' }} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((product) => (
            <article key={product.id} className="group rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-3 transition hover:border-brand/30">
              <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-xl bg-zinc-800">
                <Image src={product.images[0] ?? '/placeholder-product.svg'} alt={product.name} fill sizes="260px" className="object-cover transition group-hover:scale-105" />
                {product.stock <= 0 ? <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">Sem estoque</span> : null}
              </Link>
              <div className="mt-3 grid gap-2">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-white hover:text-brand">{product.name}</Link>
                  <button type="button" className="text-brand transition active:scale-125" onClick={() => void remove(product)} aria-label="Remover favorito">
                    <Heart className="size-5 fill-current" />
                  </button>
                </div>
                <p className="font-bold text-brand">{currencyFormatter.format(product.price)}</p>
                <Button
                  disabled={product.stock <= 0}
                  onClick={() => addItem({ id: product.id, productId: product.id, slug: product.slug, name: product.name, image: product.images[0] ?? '/placeholder-product.svg', price: product.price, quantity: 1, stock: product.stock })}
                >
                  Adicionar ao carrinho
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {removed ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-white/[0.08] bg-zinc-900 px-4 py-3 text-sm text-white shadow-2xl">
          Removido dos favoritos.
          <button type="button" className="ml-3 font-semibold text-brand" onClick={() => void undo()}>Desfazer</button>
        </div>
      ) : null}
    </div>
  );
}
