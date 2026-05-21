import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductFilters } from '@/components/store/ProductFilters';
import { ProductGrid } from '@/components/store/ProductGrid';
import { getCategories, getProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Produtos | Cafe Store',
  description: 'Catalogo de cafes premium e acessorios.',
};

export const dynamic = 'force-dynamic';

type ProductsPageProps = {
  searchParams: {
    category?: string;
    q?: string;
    sort?: string;
    page?: string;
  };
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = Number.parseInt(searchParams.page ?? '1', 10);
  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({
      category: searchParams.category,
      search: searchParams.q,
      sort: searchParams.sort,
      page: Number.isNaN(page) ? 1 : page,
      perPage: 12,
    }),
  ]);

  const baseParams = new URLSearchParams();

  if (searchParams.category) {
    baseParams.set('category', searchParams.category);
  }

  if (searchParams.q) {
    baseParams.set('q', searchParams.q);
  }

  if (searchParams.sort) {
    baseParams.set('sort', searchParams.sort);
  }

  return (
    <main className="container-page grid gap-8 py-12">
      <div>
        <h1 className="font-display text-4xl font-semibold text-text-primary">Produtos</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
          Filtre por categoria, busque por nome e escolha o lote ideal para seu preparo.
        </p>
      </div>
      <ProductFilters
        categories={categories}
        selectedCategory={searchParams.category}
        search={searchParams.q}
        sort={searchParams.sort}
      />
      <ProductGrid products={result.products} />
      {result.pagination.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: result.pagination.totalPages }, (_, index) => index + 1).map((pageNumber) => {
            const params = new URLSearchParams(baseParams);
            params.set('page', String(pageNumber));

            return (
              <Link
                key={pageNumber}
                href={`/products?${params.toString()}`}
                className={
                  pageNumber === result.pagination.page
                    ? 'led-amber rounded-xl bg-accent-primary px-4 py-2 text-sm font-semibold text-background-base'
                    : 'rounded-xl border border-white/10 px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary/40 hover:text-text-primary'
                }
              >
                {pageNumber}
              </Link>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
