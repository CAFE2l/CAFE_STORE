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
      order: { userId: session.user.id },
    },
    select: { id: true },
  });

  // Filter out any blob: URLs that were never uploaded — only persist http(s) URLs
  const persistedImages = (parsedBody.data.images ?? []).filter((url) =>
    url.startsWith('http://') || url.startsWith('https://'),
  );

  let review;
  try {
    review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: parsedBody.data.productId,
        rating: parsedBody.data.rating,
        comment: parsedBody.data.comment,
        images: persistedImages,
        videoUrl: parsedBody.data.videoUrl ?? null,
        verifiedPurchase: Boolean(verifiedPurchase),
        approved: false,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao salvar avaliacao.';
    return Response.json({ success: false, error: message }, { status: 500 });
  }

  return Response.json(
    {
      success: true,
      data: review,
    },
    { status: 201 },
  );
}
