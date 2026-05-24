import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(_request: Request, { params }: { params: { productId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  await prisma.wishlist.deleteMany({
    where: {
      userId: session.user.id,
      productId: params.productId,
    },
  });

  return Response.json({ success: true });
}
