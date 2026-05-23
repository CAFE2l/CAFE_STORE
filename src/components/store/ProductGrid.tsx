'use client';

import { ProductCard } from '@/components/store/ProductCard';
import type { ProductListItem } from '@/lib/products';

type ProductGridProps = {
  products: ProductListItem[];
  onCartOpen?: () => void;
};

export function ProductGrid({ products, onCartOpen }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 animate-float text-6xl">😔</div>
        <h2 className="text-2xl font-bold text-white">Nenhum produto encontrado</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
          Tente ajustar os filtros ou explorar todas as categorias.
        </p>
        <a
          href="/products"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF7A00] px-6 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,122,0,0.25)] transition-all duration-200 hover:shadow-[0_0_35px_rgba(255,122,0,0.4)]"
        >
          Limpar filtros
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} onCartOpen={onCartOpen} />
      ))}
    </div>
  );
}
