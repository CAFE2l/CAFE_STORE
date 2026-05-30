'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, Suspense } from 'react';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ProductFilters } from '@/components/store/ProductFilters';
import { CartDrawer } from '@/components/store/CartDrawer';
import { useCartStore } from '@/store/cart';
import type { ProductListItem } from '@/lib/products';

type ProductsPageClientProps = {
  categories: { id: string; name: string; slug: string }[];
  products: ProductListItem[];
  favoriteIds: string[];
  total: number;
  totalPages: number;
  page: number;
  params: { category?: string; q?: string; sort?: string };
};

function SkeletonCard() {
  return (
    <div className="animate-shimmer rounded-2xl border border-white/[0.05] bg-[#1a1a1a]">
      <div className="aspect-square rounded-t-2xl bg-[#222]" />
      <div className="grid gap-2 p-4">
        <div className="h-3 w-16 rounded bg-[#222]" />
        <div className="h-4 w-3/4 rounded bg-[#222]" />
        <div className="h-3 w-20 rounded bg-[#222]" />
        <div className="mt-1 h-5 w-24 rounded bg-[#222]" />
        <div className="mt-2 h-9 w-full rounded-xl bg-[#222]" />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

function buildUrl(base: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export function ProductsPageClient({ categories, products, favoriteIds, total, totalPages, page, params }: ProductsPageClientProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const count = useCartStore((s) => s.count);
  const router = useRouter();
  const pathname = usePathname() ?? '/products';
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleFilter = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  }, []);

  return (
    <main className="min-h-screen bg-[#000] px-6 pb-16 pt-20">
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.05)_0%,transparent_70%)]" />
        <div className="absolute left-24 top-1/2 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,60,56,0.03)_0%,transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-7xl">

        {/* header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {params.category ? params.category.replace(/-/g, ' ') : 'Apoios simbolicos'}
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {total} apoios encontrados. Itens ilustrativos, sem envio fisico.
          </p>
          <div className="mt-3 h-0.5 w-12 rounded-full bg-orange-500" />
        </div>

        {/* cart button mobile */}
        {mounted ? (
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF7A00] text-white shadow-[0_0_25px_rgba(255,122,0,0.35)] transition-all duration-200 hover:shadow-[0_0_40px_rgba(255,122,0,0.5)] lg:hidden"
            aria-label="Abrir carrinho"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF3C38] text-[10px] font-bold text-white animate-bounce-badge">
                {count}
              </span>
            ) : null}
          </button>
        ) : null}

        {/* filters */}
        <ProductFilters categories={categories} />

        {/* products */}
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="mt-8">
            <ProductGrid products={products} favoriteIds={favoriteIds} onCartOpen={() => setCartOpen(true)} />
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 ? (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginação">
            {page > 1 ? (
              <Link
                href={buildUrl(pathname, { ...params, page: String(page - 1) })}
                className="grid size-10 place-items-center rounded-xl border border-zinc-700 text-sm text-zinc-400 transition hover:border-[#FF7A00]/40 hover:text-white"
                onClick={handleFilter}
              >
                ←
              </Link>
            ) : null}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildUrl(pathname, { ...params, page: String(p) })}
                className={`grid size-10 place-items-center rounded-xl text-sm font-medium transition ${
                  p === page
                    ? 'bg-[#FF7A00] text-white shadow-[0_0_15px_rgba(255,122,0,0.3)]'
                    : 'border border-zinc-700 text-zinc-400 hover:border-[#FF7A00]/40 hover:text-white'
                }`}
                onClick={handleFilter}
              >
                {p}
              </Link>
            ))}
            {page < totalPages ? (
              <Link
                href={buildUrl(pathname, { ...params, page: String(page + 1) })}
                className="grid size-10 place-items-center rounded-xl border border-zinc-700 text-sm text-zinc-400 transition hover:border-[#FF7A00]/40 hover:text-white"
                onClick={handleFilter}
              >
                →
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </main>
  );
}
