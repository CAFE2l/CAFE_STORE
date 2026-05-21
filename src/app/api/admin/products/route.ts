import { ProductStatus } from '@prisma/client';
import { getAdminProducts, requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { adminProductSchema } from '@/lib/validations';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  return Response.json({ success: true, data: await getAdminProducts() });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  if (!process.env.DATABASE_URL) return Response.json({ success: false, error: 'Banco Neon ainda nao configurado.' }, { status: 503 });

  const parsed = adminProductSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 });

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      description: parsed.data.description || null,
      oldPrice: parsed.data.oldPrice ?? null,
      variants: parsed.data.variants ?? undefined,
      status: parsed.data.status as ProductStatus,
    },
  });

  return Response.json({ success: true, data: product }, { status: 201 });
}
