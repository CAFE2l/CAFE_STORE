'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { cn } from '@/lib/utils';

export function RecentlyViewed() {
  const { items } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <section className="container-page py-12">
      <h2 className="font-display text-2xl font-bold text-text-primary">Vistos recentemente</h2>
      <div className="mt-5 flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            className={cn(
              'group flex min-w-[140px] flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3',
              'transition-all duration-200 hover:border-brand/30 hover:bg-zinc-900',
            )}
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800">
              <Image src={item.image} alt={item.name} fill sizes="140px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <p className="line-clamp-2 text-xs font-medium text-zinc-300">{item.name}</p>
            <p className="text-sm font-bold text-brand">
              {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
