import { getAdminCategories, requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { adminCategorySchema } from '@/lib/validations';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  return Response.json({ success: true, data: await getAdminCategories() });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  if (!process.env.DATABASE_URL) return Response.json({ success: false, error: 'Banco Neon ainda nao configurado.' }, { status: 503 });

  const parsed = adminCategorySchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 });

  const category = await prisma.category.create({
    data: { ...parsed.data, image: parsed.data.image || null },
  });
  return Response.json({ success: true, data: category }, { status: 201 });
}
