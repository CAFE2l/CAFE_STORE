'use client';

import { ProductCard } from '@/components/store/ProductCard';
import type { ProductListItem } from '@/lib/products';
import { PackageSearch } from 'lucide-react';

type ProductGridProps = {
  products: ProductListItem[];
  favoriteIds?: string[];
  onCartOpen?: () => void;
};

export function ProductGrid({ products, favoriteIds = [], onCartOpen }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-20 text-center shadow-card backdrop-blur-md">
        <div className="mb-6 grid h-16 w-16 animate-float place-items-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-200">
          <PackageSearch className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-white">Nenhum apoio encontrado</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
          Tente ajustar os filtros ou explorar todas as categorias.
        </p>
        <a
          href="/products"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/15 px-6 text-sm font-bold text-orange-100 shadow-[0_0_20px_rgba(255,122,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-500/25 hover:shadow-[0_0_35px_rgba(255,122,0,0.32)]"
        >
          Limpar filtros
        </a>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} isFavorited={favoriteIds.includes(product.id)} onCartOpen={onCartOpen} />
      ))}
    </div>
  );
}
