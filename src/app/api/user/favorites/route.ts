import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const favorites = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    orderBy: { id: 'desc' },
    include: {
      product: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
          reviews: { where: { approved: true }, select: { rating: true } },
        },
      },
    },
  });

  return Response.json({
    success: true,
    data: favorites.map((favorite) => {
      const ratings = favorite.product.reviews.map((review) => review.rating);
      const averageRating = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

      return {
        id: favorite.id,
        product: {
          id: favorite.product.id,
          name: favorite.product.name,
          slug: favorite.product.slug,
          description: favorite.product.description,
          price: favorite.product.price.toNumber(),
          oldPrice: favorite.product.oldPrice?.toNumber() ?? null,
          stock: favorite.product.stock,
          images: favorite.product.images,
          status: favorite.product.status,
          featured: favorite.product.featured,
          category: favorite.product.category,
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

  await prisma.wishlist.upsert({
    where: { userId_productId: { userId: session.user.id, productId: body.productId } },
    update: {},
    create: { userId: session.user.id, productId: body.productId },
  });

  return Response.json({ success: true });
}
