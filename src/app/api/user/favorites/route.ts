import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const [wishlist, legacyFavorites] = await Promise.all([
    prisma.wishlist.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    }),
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    }),
  ]);
  const productIds = Array.from(new Set([...wishlist, ...legacyFavorites].map((favorite) => favorite.productId)));

  const favorites = await prisma.product.findMany({
    where: { id: { in: productIds } },
    orderBy: { name: 'asc' },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: { where: { approved: true }, select: { rating: true } },
    },
  });

  return Response.json({
    success: true,
    data: favorites.map((product) => {
      const ratings = product.reviews.map((review) => review.rating);
      const averageRating = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

      return {
        id: product.id,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price.toNumber(),
          oldPrice: product.oldPrice?.toNumber() ?? null,
          stock: product.stock,
          images: product.images,
          status: product.status,
          featured: product.featured,
          category: product.category,
          reviewCount: ratings.length,
          averageRating,
        },
      };
    }),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const body = (await request.json()) as { productId?: string };
  if (!body.productId) {
    return Response.json({ success: false, error: 'Produto obrigatorio.' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.wishlist.upsert({
      where: { userId_productId: { userId: session.user.id, productId: body.productId } },
      update: {},
      create: { userId: session.user.id, productId: body.productId },
    }),
    prisma.favorite.upsert({
      where: { userId_productId: { userId: session.user.id, productId: body.productId } },
      update: {},
      create: { userId: session.user.id, productId: body.productId },
    }),
  ]);

  return Response.json({ success: true });
}
