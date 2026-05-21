import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { wishlistToggleSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      {
        success: false,
        error: 'Nao autenticado.',
      },
      { status: 401 },
    );
  }

  if (!process.env.DATABASE_URL) {
    return Response.json(
      {
        success: false,
        error: 'Banco Neon ainda nao configurado.',
      },
      { status: 503 },
    );
  }

  const body: unknown = await request.json();
  const parsedBody = wishlistToggleSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      {
        success: false,
        error: parsedBody.error.issues[0]?.message ?? 'Dados invalidos.',
      },
      { status: 400 },
    );
  }

  const existingWishlistItem = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: parsedBody.data.productId,
      },
    },
  });

  if (existingWishlistItem) {
    await prisma.wishlist.delete({
      where: {
        id: existingWishlistItem.id,
      },
    });

    return Response.json({
      success: true,
      data: {
        favorited: false,
      },
    });
  }

  await prisma.wishlist.create({
    data: {
      userId: session.user.id,
      productId: parsedBody.data.productId,
    },
  });

  return Response.json({
    success: true,
    data: {
      favorited: true,
    },
  });
}
