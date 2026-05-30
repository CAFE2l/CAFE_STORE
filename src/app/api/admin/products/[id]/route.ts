import { ProductStatus } from '@prisma/client';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { adminProductSchema } from '@/lib/validations';
import { generateSku, sanitizeSku } from '@/lib/sku';

type ProductRouteProps = { params: { id: string } };

export async function PUT(request: Request, { params }: ProductRouteProps) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  if (!process.env.DATABASE_URL) return Response.json({ success: false, error: 'Banco Neon ainda nao configurado.' }, { status: 503 });

  const parsed = adminProductSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 });

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      sku: sanitizeSku(parsed.data.sku) || generateSku(parsed.data.name),
      description: parsed.data.description || null,
      oldPrice: parsed.data.oldPrice ?? null,
      variants: parsed.data.variants ?? undefined,
      status: parsed.data.status as ProductStatus,
    },
  });

  return Response.json({ success: true, data: product });
}

export async function DELETE(_request: Request, { params }: ProductRouteProps) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  if (!process.env.DATABASE_URL) return Response.json({ success: false, error: 'Banco Neon ainda nao configurado.' }, { status: 503 });

  await prisma.product.delete({ where: { id: params.id } });
  return Response.json({ success: true, data: { deleted: true } });
}
