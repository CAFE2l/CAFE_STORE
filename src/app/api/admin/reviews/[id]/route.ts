import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { adminReviewModerationSchema } from '@/lib/validations';

type ReviewRouteProps = { params: { id: string } };

export async function PUT(request: Request, { params }: ReviewRouteProps) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  if (!process.env.DATABASE_URL) return Response.json({ success: false, error: 'Banco Neon ainda nao configurado.' }, { status: 503 });

  const parsed = adminReviewModerationSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 });

  const review = await prisma.review.update({
    where: { id: params.id },
    data: { approved: parsed.data.approved },
  });
  return Response.json({ success: true, data: review });
}

export async function DELETE(_request: Request, { params }: ReviewRouteProps) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  if (!process.env.DATABASE_URL) return Response.json({ success: false, error: 'Banco Neon ainda nao configurado.' }, { status: 503 });

  await prisma.review.delete({ where: { id: params.id } });
  return Response.json({ success: true, data: { deleted: true } });
}
