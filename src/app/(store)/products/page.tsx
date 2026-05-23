import type { Metadata } from 'next';
import { getCategories, getProducts } from '@/lib/products';
import { ProductsPageClient } from '@/components/store/ProductsPageClient';

export const metadata: Metadata = {
  title: 'Produtos | CAFÉ STORE',
  description: 'Confira nossa seleção de produtos digitais e físicos da marca CAFÉ.',
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

  return (
    <ProductsPageClient
      categories={categories}
      products={result.products}
      total={result.pagination.total}
      totalPages={result.pagination.totalPages}
      page={page}
      params={{ category: params.category, q: params.q, sort: params.sort }}
    />
  );
}
