import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ProductFilters } from '@/components/store/ProductFilters';
import { getCategories, getProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Produtos | CAFÉ Store',
  description: 'Confira nossa seleção de cafés especiais, equipamentos e acessórios.',
};

export const dynamic = 'force-dynamic';

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

const PER_PAGE = 12;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({ category: params.category, search: params.q, sort: params.sort, page, perPage: PER_PAGE }),
  ]);
  const products = result.products;
  const total = result.pagination.total;
  const totalPages = result.pagination.totalPages;

  return (
    <main className="container-page py-8">
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/" className="transition hover:text-cafe-orange-500">Home</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-text-primary">Produtos</span>
        {params.category ? (
          <>
            <span className="mx-2">&gt;</span>
            <span className="text-text-primary capitalize">{params.category}</span>
          </>
        ) : null}
      </nav>

      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-text-primary">
          {params.category ? params.category.replace(/-/g, ' ') : 'Todos os Produtos'}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{total} produtos encontrados</p>
      </div>

      <ProductFilters
        categories={categories}
        selectedCategory={params.category}
        search={params.q}
        sort={params.sort}
      />

      <div className="mt-8">
        <ProductGrid products={products} />
      </div>

      {totalPages > 1 ? (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginação">
          {page > 1 ? (
            <Link
              href={`/products?page=${page - 1}${params.category ? `&category=${params.category}` : ''}${params.q ? `&q=${params.q}` : ''}${params.sort ? `&sort=${params.sort}` : ''}`}
              className="grid size-10 place-items-center rounded-button border border-border-subtle text-sm text-text-secondary transition hover:border-cafe-orange-500/40 hover:text-text-primary"
            >
              ←
            </Link>
          ) : null}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/products?page=${p}${params.category ? `&category=${params.category}` : ''}${params.q ? `&q=${params.q}` : ''}${params.sort ? `&sort=${params.sort}` : ''}`}
              className={`grid size-10 place-items-center rounded-button text-sm font-medium transition ${
                p === page
                  ? 'bg-cafe-red-500 text-white'
                  : 'border border-border-subtle text-text-secondary hover:border-cafe-orange-500/40 hover:text-text-primary'
              }`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages ? (
            <Link
              href={`/products?page=${page + 1}${params.category ? `&category=${params.category}` : ''}${params.q ? `&q=${params.q}` : ''}${params.sort ? `&sort=${params.sort}` : ''}`}
              className="grid size-10 place-items-center rounded-button border border-border-subtle text-sm text-text-secondary transition hover:border-cafe-orange-500/40 hover:text-text-primary"
            >
              →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
