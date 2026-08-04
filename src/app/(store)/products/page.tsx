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
  searchParams: {
    category?: string;
    q?: string;
    sort?: string;
    page?: string;
  };
};

const PER_PAGE = 12;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = searchParams;
  const page = Number(params.page) || 1;

  const session = await auth();
  const userId = session?.user?.id;

  const [categories, result, userWishlist, userLegacyFavorites] = await Promise.all([
    getCategories(),
    getProducts({ category: params.category, search: params.q, sort: params.sort, page, perPage: PER_PAGE }),
    userId
      ? prisma.wishlist.findMany({ where: { userId }, select: { productId: true } })
      : Promise.resolve([]),
    userId
      ? prisma.favorite.findMany({ where: { userId }, select: { productId: true } })
      : Promise.resolve([]),
  ]);

  const favoriteIds = Array.from(new Set([...userWishlist, ...userLegacyFavorites].map((f) => f.productId)));

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
