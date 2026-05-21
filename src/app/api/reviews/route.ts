import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reviewCreateSchema } from '@/lib/validations';

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
  const parsedBody = reviewCreateSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      {
        success: false,
        error: parsedBody.error.issues[0]?.message ?? 'Dados invalidos.',
      },
      { status: 400 },
    );
  }

  const verifiedPurchase = await prisma.orderItem.findFirst({
    where: {
      productId: parsedBody.data.productId,
      order: {
        userId: session.user.id,
      },
    },
    select: {
      id: true,
    },
  });

  const review = await prisma.review.create({
    data: {
      userId: session.user.id,
      productId: parsedBody.data.productId,
      rating: parsedBody.data.rating,
      comment: parsedBody.data.comment,
      verifiedPurchase: Boolean(verifiedPurchase),
      approved: false,
    },
  });

  return Response.json(
    {
      success: true,
      data: review,
    },
    { status: 201 },
  );
}
