import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { adminCategorySchema } from '@/lib/validations';

type CategoryRouteProps = { params: { id: string } };

export async function PUT(request: Request, { params }: CategoryRouteProps) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  if (!process.env.DATABASE_URL) return Response.json({ success: false, error: 'Banco Neon ainda nao configurado.' }, { status: 503 });

  const parsed = adminCategorySchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 });

  const category = await prisma.category.update({
    where: { id: params.id },
    data: { ...parsed.data, image: parsed.data.image || null },
  });
  return Response.json({ success: true, data: category });
}

export async function DELETE(_request: Request, { params }: CategoryRouteProps) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  if (!process.env.DATABASE_URL) return Response.json({ success: false, error: 'Banco Neon ainda nao configurado.' }, { status: 503 });

  await prisma.category.delete({ where: { id: params.id } });
  return Response.json({ success: true, data: { deleted: true } });
}
