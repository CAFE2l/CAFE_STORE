import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCategories, getProducts } from '@/lib/products';
import { ProductsPageClient } from '@/components/store/ProductsPageClient';

export const metadata: Metadata = {
  title: 'Apoios | CAFÉ STORE',
  description: 'Apoios simbolicos da marca CAFÉ. Itens ilustrativos sem entrega fisica.',
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

  const session = await auth();

  const [categories, result, userFavorites] = await Promise.all([
    getCategories(),
    getProducts({ category: params.category, search: params.q, sort: params.sort, page, perPage: PER_PAGE }),
    session?.user?.id
      ? prisma.favorite.findMany({ where: { userId: session.user.id }, select: { productId: true } })
      : Promise.resolve([]),
  ]);

  const favoriteIds = userFavorites.map((f) => f.productId);

  return (
    <ProductsPageClient
      categories={categories}
      products={result.products}
      favoriteIds={favoriteIds}
      total={result.pagination.total}
      totalPages={result.pagination.totalPages}
      page={page}
      params={{ category: params.category, q: params.q, sort: params.sort }}
    />
  );
}
